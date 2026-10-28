package com.coding.crud.gestion_gastos.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class GastoRequestDTO {

    //Lo obtiene desde la clase de Gasto

    @NotBlank(message = "La descripcion no puede estar vacia")
    @Size(max = 255, message = "La descripción no puede exceder 255 caracteres")
    private String descripcion;

    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser un valor positivo")
    private BigDecimal monto;

    @NotBlank(message = "La categoria es obligatoria")
    private String categoria;

    @NotNull(message = "La fecha es obligatoria")
    @PastOrPresent(message = "La fecha no puede ser futura")
    private LocalDate fecha;
}
