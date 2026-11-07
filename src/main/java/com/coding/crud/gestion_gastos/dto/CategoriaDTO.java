package com.coding.crud.gestion_gastos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategoriaDTO {
    private Long id;
    private String nombre;
    private int prioridad;
    private String color;
    // null si la categoría no pertenece a ningún grupo
    private Long grupoId;
}
