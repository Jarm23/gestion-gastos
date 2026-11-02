package com.coding.crud.gestion_gastos.controller;

import com.coding.crud.gestion_gastos.dto.CategoriaDTO;
import com.coding.crud.gestion_gastos.dto.CategoriaRequestDTO;
import com.coding.crud.gestion_gastos.service.CategoriaService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categorias")
@CrossOrigin(originPatterns = "http://localhost:*")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    public ResponseEntity<List<CategoriaDTO>> listar(HttpSession session) {
        return ResponseEntity.ok(categoriaService.listar(SesionUsuario.requerirId(session)));
    }

    @PostMapping
    public ResponseEntity<CategoriaDTO> crear(@Valid @RequestBody CategoriaRequestDTO request, HttpSession session) {
        return new ResponseEntity<>(categoriaService.crear(SesionUsuario.requerirId(session), request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaDTO> actualizar(@PathVariable Long id,
                                                   @Valid @RequestBody CategoriaRequestDTO request,
                                                   HttpSession session) {
        return ResponseEntity.ok(categoriaService.actualizar(SesionUsuario.requerirId(session), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, HttpSession session) {
        categoriaService.eliminar(SesionUsuario.requerirId(session), id);
        return ResponseEntity.noContent().build();
    }
}
