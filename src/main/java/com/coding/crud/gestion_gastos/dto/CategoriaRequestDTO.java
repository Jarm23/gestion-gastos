package com.coding.crud.gestion_gastos.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CategoriaRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 50, message = "El nombre no puede exceder 50 caracteres")
    private String nombre;

    @NotNull(message = "La prioridad es obligatoria")
    @Min(value = 1, message = "La prioridad debe ser 1 o mayor")
    private Integer prioridad;

    @NotNull(message = "El color es obligatorio")
    @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "El color no es válido")
    private String color;

    // Opcional: sin valor, la categoría queda fuera de cualquier grupo
    private Long grupoId;
}
