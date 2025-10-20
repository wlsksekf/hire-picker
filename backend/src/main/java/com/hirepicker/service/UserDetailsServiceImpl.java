package com.hirepicker.service;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.repository.PersonalUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final PersonalUserRepository personalUserRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        PersonalUser personalUser = personalUserRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Could not find user with email: " + email));

        return new CustomUserDetails(personalUser);
    }
}
