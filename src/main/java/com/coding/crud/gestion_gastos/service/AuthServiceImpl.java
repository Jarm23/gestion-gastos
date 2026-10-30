package com.coding.crud.gestion_gastos.service;

import com.coding.crud.gestion_gastos.dto.LoginRequestDTO;
import com.coding.crud.gestion_gastos.dto.RegistroRequestDTO;
import com.coding.crud.gestion_gastos.dto.UsuarioDTO;
import com.coding.crud.gestion_gastos.exception.AuthException;
import com.coding.crud.gestion_gastos.model.Usuario;
import com.coding.crud.gestion_gastos.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthServiceImpl(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UsuarioDTO registrar(RegistroRequestDTO request) {
        String email = request.getEmail().trim().toLowerCase();
        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new AuthException(HttpStatus.CONFLICT, "Ya existe una cuenta con ese email");
        }
        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre().trim());
        usuario.setEmail(email);
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        return toDTO(usuarioRepository.save(usuario));
    }

    @Override
    public UsuarioDTO login(LoginRequestDTO request) {
        // Mismo mensaje si el email no existe o la contraseña falla, para no revelar qué cuentas existen
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(request.getEmail().trim())
                .filter(u -> passwordEncoder.matches(request.getPassword(), u.getPassword()))
                .orElseThrow(() -> new AuthException(HttpStatus.UNAUTHORIZED, "Email o contraseña incorrectos"));
        return toDTO(usuario);
    }

    private UsuarioDTO toDTO(Usuario u) {
        return new UsuarioDTO(u.getId(), u.getNombre(), u.getEmail());
    }
}
