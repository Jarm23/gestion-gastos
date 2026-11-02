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
import java.util.List;

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
