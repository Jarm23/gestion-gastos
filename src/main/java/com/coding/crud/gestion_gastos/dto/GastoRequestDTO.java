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
    @Digits(integer = 10, fraction = 2, message = "El monto admite como máximo 2 decimales")
    private BigDecimal monto;

    @NotNull(message = "La categoria es obligatoria")
    private Long categoriaId;

    @NotNull(message = "La fecha es obligatoria")
    @PastOrPresent(message = "La fecha no puede ser futura")
    private LocalDate fecha;
}
