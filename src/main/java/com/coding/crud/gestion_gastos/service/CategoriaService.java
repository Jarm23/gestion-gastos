package com.coding.crud.gestion_gastos.service;

import com.coding.crud.gestion_gastos.dto.CategoriaDTO;
import com.coding.crud.gestion_gastos.dto.CategoriaRequestDTO;

import java.util.List;

public interface CategoriaService {
    List<CategoriaDTO> listar(Long usuarioId);
    CategoriaDTO crear(Long usuarioId, CategoriaRequestDTO request);
    CategoriaDTO actualizar(Long usuarioId, Long id, CategoriaRequestDTO request);
    void eliminar(Long usuarioId, Long id);
    void crearPredeterminadasSiFaltan(Long usuarioId);
}
