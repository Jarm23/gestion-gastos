package com.coding.crud.gestion_gastos.service;

import com.coding.crud.gestion_gastos.dto.GastoDTO;
import com.coding.crud.gestion_gastos.dto.GastoRequestDTO;
import com.coding.crud.gestion_gastos.exception.ApiException;
import com.coding.crud.gestion_gastos.model.Categoria;
import com.coding.crud.gestion_gastos.model.Gasto;
import com.coding.crud.gestion_gastos.repository.CategoriaRepository;
import com.coding.crud.gestion_gastos.repository.GastoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GastoServiceImpl implements GastoService {

    private final GastoRepository gastoRepository;
    private final CategoriaRepository categoriaRepository;

    public GastoServiceImpl(GastoRepository gastoRepository, CategoriaRepository categoriaRepository) {
        this.gastoRepository = gastoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<GastoDTO> listarPorAnio(Long usuarioId, int anio) {
        return gastoRepository.findByUsuarioIdAndFechaBetweenOrderByFechaDescIdDesc(
                        usuarioId, LocalDate.of(anio, 1, 1), LocalDate.of(anio, 12, 31)).stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional
    public GastoDTO crear(Long usuarioId, GastoRequestDTO request) {
        Categoria categoria = categoriaRepository.findByIdAndUsuarioId(request.getCategoriaId(), usuarioId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Categoría no encontrada"));
        Gasto gasto = new Gasto();
        gasto.setDescripcion(request.getDescripcion().trim());
        gasto.setMonto(request.getMonto());
        gasto.setFecha(request.getFecha());
        gasto.setCategoria(categoria);
        gasto.setUsuario(categoria.getUsuario());
        return toDTO(gastoRepository.save(gasto));
    }

    @Override
    @Transactional // si una fila falla, no se guarda ninguna
    public List<GastoDTO> importar(Long usuarioId, List<GastoRequestDTO> gastos) {
        // Una sola consulta para las categorías, en vez de una por fila
        Map<Long, Categoria> categorias = categoriaRepository.findByUsuarioIdOrderByPrioridadAsc(usuarioId).stream()
                .collect(Collectors.toMap(Categoria::getId, c -> c));

        List<Gasto> nuevos = new ArrayList<>();
        for (GastoRequestDTO request : gastos) {
            // Solo valen categorías del usuario de la sesión, nunca el id tal cual llega del navegador
            Categoria categoria = categorias.get(request.getCategoriaId());
            if (categoria == null) {
                throw new ApiException(HttpStatus.NOT_FOUND, "Categoría no encontrada");
            }
            Gasto gasto = new Gasto();
            gasto.setDescripcion(request.getDescripcion().trim());
            gasto.setMonto(request.getMonto());
            gasto.setFecha(request.getFecha());
            gasto.setCategoria(categoria);
            gasto.setUsuario(categoria.getUsuario());
            nuevos.add(gasto);
        }
        return gastoRepository.saveAll(nuevos).stream().map(this::toDTO).toList();
    }

    @Override
    @Transactional
    public void eliminar(Long usuarioId, Long id) {
        Gasto gasto = gastoRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Gasto no encontrado"));
        gastoRepository.delete(gasto);
    }

    private GastoDTO toDTO(Gasto g) {
        return new GastoDTO(g.getId(), g.getDescripcion(), g.getMonto(),
                g.getCategoria().getId(), g.getCategoria().getNombre(), g.getFecha());
    }
}
