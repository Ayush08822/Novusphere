package com.AyushToCode.MessageService.service;

import com.AyushToCode.MessageService.DTO.EmailDto;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender sender;

    public void sendEmail(EmailDto emailDto) {
        List<String> emails = emailDto.getAllEmailOnCourseId();
        System.out.println(emailDto.getEmail());
        String subject = "Announcement.....";
        String body = "An Announcement has being made. Please check out for further information. Thank you! ";
        for(String email: emails) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(emailDto.getEmail());

            message.setTo(email);
            message.setSubject(subject);
            message.setText(body);

            sender.send(message);
        }
    }
}
