package com.coding.crud.gestion_gastos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ImportarGastosRequestDTO {
    @NotEmpty(message = "El archivo esta vacio")
    @Size(max = 1000, message = "Como máximo 1000 gastos por importación")
    private List<@Valid GastoRequestDTO> gastos;
}
