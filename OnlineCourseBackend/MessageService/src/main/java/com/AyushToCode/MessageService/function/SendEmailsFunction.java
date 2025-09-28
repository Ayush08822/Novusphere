package com.AyushToCode.MessageService.function;

import com.AyushToCode.MessageService.DTO.EmailDto;
import com.AyushToCode.MessageService.service.EmailService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.function.Consumer;

@Configuration
@Slf4j
@AllArgsConstructor
public class SendEmailsFunction {

    private EmailService emailService;
    @Bean
    public Consumer<EmailDto> sendEmails() {
        return emailDTO -> {
            log.info("Calling service class");
            emailService.sendEmail(emailDTO);
            log.info("Returning from service class");
        };
    }
}
