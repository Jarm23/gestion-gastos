package com.coding.crud.gestion_gastos.service;

import com.coding.crud.gestion_gastos.dto.LoginRequestDTO;
import com.coding.crud.gestion_gastos.dto.RegistroRequestDTO;
import com.coding.crud.gestion_gastos.dto.UsuarioDTO;

public interface AuthService {
    UsuarioDTO registrar(RegistroRequestDTO request);
    UsuarioDTO login(LoginRequestDTO request);
}
