package com.coding.crud.gestion_gastos.service;

import com.coding.crud.gestion_gastos.dto.CategoriaDTO;
import com.coding.crud.gestion_gastos.dto.CategoriaRequestDTO;
import com.coding.crud.gestion_gastos.exception.ApiException;
import com.coding.crud.gestion_gastos.model.Categoria;
import com.coding.crud.gestion_gastos.repository.CategoriaRepository;
import com.coding.crud.gestion_gastos.repository.GastoRepository;
import com.coding.crud.gestion_gastos.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class CategoriaServiceImpl implements CategoriaService {

    // De más a menos prioritaria. El orden de los colores evita que dos vecinas en el gráfico se confundan
    private static final String[][] PREDETERMINADAS = {
            {"Gastos Fijos", "#2a78d6"},
            {"Alimentación", "#eb6834"},
            {"Salud", "#1baf7a"},
            {"Transporte", "#eda100"},
            {"Educación", "#e87ba4"},
            {"Hogar", "#008300"},
            {"Ocio", "#6250d6"},
    };

    private final CategoriaRepository categoriaRepository;
    private final GastoRepository gastoRepository;
    private final UsuarioRepository usuarioRepository;

    public CategoriaServiceImpl(CategoriaRepository categoriaRepository,
                                GastoRepository gastoRepository,
                                UsuarioRepository usuarioRepository) {
        this.categoriaRepository = categoriaRepository;
        this.gastoRepository = gastoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoriaDTO> listar(Long usuarioId) {
        return categoriaRepository.findByUsuarioIdOrderByPrioridadAsc(usuarioId).stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional
    public CategoriaDTO crear(Long usuarioId, CategoriaRequestDTO request) {
        String nombre = request.getNombre().trim();
        if (categoriaRepository.existsByUsuarioIdAndNombreIgnoreCase(usuarioId, nombre)) {
            throw new ApiException(HttpStatus.CONFLICT, "Ya tienes una categoría con ese nombre");
        }
        Categoria categoria = new Categoria();
        categoria.setUsuario(usuarioRepository.getReferenceById(usuarioId));
        aplicar(categoria, nombre, request.getColor());
        colocar(usuarioId, categoria, request.getPrioridad());
        return toDTO(categoria);
    }

    @Override
    @Transactional
    public CategoriaDTO actualizar(Long usuarioId, Long id, CategoriaRequestDTO request) {
        Categoria categoria = buscar(usuarioId, id);
        String nombre = request.getNombre().trim();
        if (categoriaRepository.existsByUsuarioIdAndNombreIgnoreCaseAndIdNot(usuarioId, nombre, id)) {
            throw new ApiException(HttpStatus.CONFLICT, "Ya tienes una categoría con ese nombre");
        }
        aplicar(categoria, nombre, request.getColor());
        colocar(usuarioId, categoria, request.getPrioridad());
        return toDTO(categoria);
    }

    @Override
    @Transactional
    public void eliminar(Long usuarioId, Long id) {
        Categoria categoria = buscar(usuarioId, id);
        if (gastoRepository.existsByCategoriaId(id)) {
            throw new ApiException(HttpStatus.CONFLICT, "No puedes eliminar una categoría que tiene gastos");
        }
        List<Categoria> resto = new ArrayList<>(categoriaRepository.findByUsuarioIdOrderByPrioridadAsc(usuarioId));
        resto.removeIf(c -> Objects.equals(c.getId(), id));
        if (resto.isEmpty()) {
            throw new ApiException(HttpStatus.CONFLICT, "Debes conservar al menos una categoría");
        }
        categoriaRepository.delete(categoria);
        renumerar(resto);
    }

    @Override
    @Transactional
    public void crearPredeterminadasSiFaltan(Long usuarioId) {
        if (categoriaRepository.existsByUsuarioId(usuarioId)) {
            return;
        }
        List<Categoria> categorias = new ArrayList<>();
        for (String[] predeterminada : PREDETERMINADAS) {
            Categoria categoria = new Categoria();
            categoria.setUsuario(usuarioRepository.getReferenceById(usuarioId));
            aplicar(categoria, predeterminada[0], predeterminada[1]);
            categorias.add(categoria);
        }
        renumerar(categorias);
    }

    private Categoria buscar(Long usuarioId, Long id) {
        return categoriaRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Categoría no encontrada"));
    }

    private void aplicar(Categoria categoria, String nombre, String color) {
        categoria.setNombre(nombre);
        categoria.setColor(color.toLowerCase());
    }

    // Inserta la categoría en la posición pedida y desplaza las demás para que no haya prioridades repetidas
    private void colocar(Long usuarioId, Categoria categoria, int prioridad) {
        List<Categoria> ordenadas = new ArrayList<>(categoriaRepository.findByUsuarioIdOrderByPrioridadAsc(usuarioId));
        ordenadas.removeIf(c -> Objects.equals(c.getId(), categoria.getId()));
        ordenadas.add(Math.min(prioridad - 1, ordenadas.size()), categoria);
        renumerar(ordenadas);
    }

    private void renumerar(List<Categoria> ordenadas) {
        for (int i = 0; i < ordenadas.size(); i++) {
            ordenadas.get(i).setPrioridad(i + 1);
        }
        categoriaRepository.saveAll(ordenadas);
    }

    private CategoriaDTO toDTO(Categoria c) {
        return new CategoriaDTO(c.getId(), c.getNombre(), c.getPrioridad(), c.getColor());
    }
}
