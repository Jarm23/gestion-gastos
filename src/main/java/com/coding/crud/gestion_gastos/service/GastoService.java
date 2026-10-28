package com.coding.crud.gestion_gastos.service;

import com.coding.crud.gestion_gastos.model.Gasto;

import java.util.List;

public interface GastoService {
    List<Gasto> obtenerTodos();
    Gasto guardarGasto(Gasto gasto);
}
