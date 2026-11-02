package com.coding.crud.gestion_gastos.controller;

import com.coding.crud.gestion_gastos.exception.AuthException;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;

// El usuario siempre sale de la sesión del servidor, nunca de un dato que envíe el cliente
final class SesionUsuario {

    static final String ATRIBUTO = "usuarioId";

    private SesionUsuario() {
    }

    static Long requerirId(HttpSession session) {
        Long usuarioId = (Long) session.getAttribute(ATRIBUTO);
        if (usuarioId == null) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Debes iniciar sesión");
        }
        return usuarioId;
    }
}
