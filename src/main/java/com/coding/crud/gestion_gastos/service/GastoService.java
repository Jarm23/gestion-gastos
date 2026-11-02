package com.coding.crud.gestion_gastos.service;

import com.coding.crud.gestion_gastos.dto.GastoDTO;
import com.coding.crud.gestion_gastos.dto.GastoRequestDTO;

import java.util.List;

public interface GastoService {
    List<GastoDTO> listarPorAnio(Long usuarioId, int anio);
    GastoDTO crear(Long usuarioId, GastoRequestDTO request);
    void eliminar(Long usuarioId, Long id);
}
