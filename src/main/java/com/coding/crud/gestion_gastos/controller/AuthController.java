package com.coding.crud.gestion_gastos.controller;

import com.coding.crud.gestion_gastos.dto.LoginRequestDTO;
import com.coding.crud.gestion_gastos.dto.RecuperarPasswordRequestDTO;
import com.coding.crud.gestion_gastos.dto.RegistroRequestDTO;
import com.coding.crud.gestion_gastos.dto.RestablecerPasswordRequestDTO;
import com.coding.crud.gestion_gastos.dto.UsuarioDTO;
import com.coding.crud.gestion_gastos.service.AuthService;
import com.coding.crud.gestion_gastos.service.RecuperacionPasswordService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(originPatterns = "https://localhost:*")
/**
 *
 *
 * Authentication class controller: this class will provide the token that the user need for access the app
 */
public class AuthController {

    private final AuthService authService;
    private final RecuperacionPasswordService recuperacionService;

    public AuthController(AuthService authService, RecuperacionPasswordService recuperacionService) {
        this.authService = authService;
        this.recuperacionService = recuperacionService;
    }

    @PostMapping("/registro")
    public ResponseEntity<UsuarioDTO> registrar(@Valid @RequestBody RegistroRequestDTO request) {
        return new ResponseEntity<>(authService.registrar(request), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<UsuarioDTO> login(@Valid @RequestBody LoginRequestDTO request, HttpServletRequest http) {
        UsuarioDTO usuario = authService.login(request);
        // Sesión nueva en cada login para evitar la fijación de sesión
        cerrarSesion(http);
        http.getSession(true).setAttribute(SesionUsuario.ATRIBUTO, usuario.getId());
        return ResponseEntity.ok(usuario);
    }

    // Siempre 204, exista o no la cuenta, para no revelar qué emails están registrados
    @PostMapping("/recuperar")
    public ResponseEntity<Void> recuperar(@Valid @RequestBody RecuperarPasswordRequestDTO request) {
        recuperacionService.solicitar(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/restablecer")
    public ResponseEntity<Void> restablecer(@Valid @RequestBody RestablecerPasswordRequestDTO request) {
        recuperacionService.restablecer(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest http) {
        cerrarSesion(http);
        return ResponseEntity.noContent().build();
    }

    private void cerrarSesion(HttpServletRequest http) {
        HttpSession session = http.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }
}
