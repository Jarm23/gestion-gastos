package com.coding.crud.gestion_gastos.controller;

import com.coding.crud.gestion_gastos.model.Gasto;
import com.coding.crud.gestion_gastos.service.GastoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/gastos")
@CrossOrigin(origins = "http://localhost:5173")public class GastoController {

    private final GastoService gastoService;

    public GastoController(GastoService gastoService) {
        this.gastoService = gastoService;
    }

    @GetMapping
    public ResponseEntity<List<Gasto>> listarGastos() {
        return  ResponseEntity.ok(gastoService.obtenerTodos());
    }

    @PostMapping
    public ResponseEntity<Gasto> crearGasto(@RequestBody Gasto gasto) {
        return new ResponseEntity<>(gastoService.guardarGasto(gasto), HttpStatus.CREATED);
    }
}
