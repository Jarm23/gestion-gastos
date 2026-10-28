package com.coding.crud.gestion_gastos.service;

import com.coding.crud.gestion_gastos.model.Gasto;
import com.coding.crud.gestion_gastos.repository.GastoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GastoServiceImpl implements GastoService {

    private final GastoRepository gastoRepository;

    public GastoServiceImpl(GastoRepository gastoRepository) {
        this.gastoRepository = gastoRepository;
    }

    @Override
    public List<Gasto> obtenerTodos() {
        return List.of();
    }

    @Override
    public Gasto guardarGasto(Gasto gasto) {
        return null;
    }
}
