package com.coding.crud.gestion_gastos.controller;

import com.coding.crud.gestion_gastos.dto.GastoDTO;
import com.coding.crud.gestion_gastos.dto.GastoRequestDTO;
import com.coding.crud.gestion_gastos.dto.ImportarGastosRequestDTO;
import com.coding.crud.gestion_gastos.service.GastoService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/gastos")
@CrossOrigin(originPatterns = "https://localhost:*")
public class GastoController {

    private final GastoService gastoService;

    public GastoController(GastoService gastoService) {
        this.gastoService = gastoService;
    }

    @GetMapping
    public ResponseEntity<List<GastoDTO>> listarGastos(@RequestParam int anio, HttpSession session) {
        return ResponseEntity.ok(gastoService.listarPorAnio(SesionUsuario.requerirId(session), anio));
    }

    @PostMapping
    public ResponseEntity<GastoDTO> crearGasto(@Valid @RequestBody GastoRequestDTO request, HttpSession session) {
        return new ResponseEntity<>(gastoService.crear(SesionUsuario.requerirId(session), request), HttpStatus.CREATED);
    }

    // Guarda todos los gastos del Excel en una sola transacción: o entran todos o ninguno
    @PostMapping("/importar")
    public ResponseEntity<List<GastoDTO>> importar(@Valid @RequestBody ImportarGastosRequestDTO request,
                                                   HttpSession session) {
        return new ResponseEntity<>(
                gastoService.importar(SesionUsuario.requerirId(session), request.getGastos()),
                HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarGasto(@PathVariable Long id, HttpSession session) {
        gastoService.eliminar(SesionUsuario.requerirId(session), id);
        return ResponseEntity.noContent().build();
    }
}
