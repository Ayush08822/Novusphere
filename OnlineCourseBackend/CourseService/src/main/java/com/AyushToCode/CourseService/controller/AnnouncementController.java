package com.AyushToCode.CourseService.controller;

import com.AyushToCode.CourseService.DTO.AnnouncementRequestDTO;
import com.AyushToCode.CourseService.DTO.AnnouncementResponseDTO;
import com.AyushToCode.CourseService.entity.Review;
import com.AyushToCode.CourseService.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announce")
@RequiredArgsConstructor

public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping("/post-announcements/{job_id}")
    public ResponseEntity<String> postAnnouncements(@AuthenticationPrincipal Jwt jwt, @RequestBody AnnouncementRequestDTO announcementRequestDTO, @PathVariable(name = "job_id") Long id){
        String userEmail = jwt.getClaimAsString("email");
        announcementService.postAnnouncements(announcementRequestDTO, userEmail, id);
        return new ResponseEntity<>("Announcement successfully created.", HttpStatus.CREATED);
    }

    @GetMapping("/get-announcements/{job_id}")
    public ResponseEntity<List<AnnouncementResponseDTO>> getAnnouncements(@PathVariable(name = "job_id") Long id){
        return new ResponseEntity<>(announcementService.getAnnouncements(id), HttpStatus.OK);
    }
    @GetMapping("/get-announcements")
    public ResponseEntity<List<AnnouncementResponseDTO>> getAllAnnouncements(@AuthenticationPrincipal Jwt jwt){
        String userEmail = jwt.getClaimAsString("email");
        return new ResponseEntity<>(announcementService.getAllAnnouncements(userEmail), HttpStatus.OK);
    }

}
