package com.AyushToCode.CourseService.controller;

import com.AyushToCode.CourseService.DTO.VideoResponseDTO;
import com.AyushToCode.CourseService.entity.VideoFile;
import com.AyushToCode.CourseService.service.VideoService;
import lombok.Data;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@Data
@RequestMapping("/api")
public class VideoController {

    private final VideoService videoService;

    @PostMapping("/videos/upload")
    public ResponseEntity<VideoResponseDTO> uploadVideo(@RequestParam("title") String title, @RequestParam("video") MultipartFile file, @RequestParam("sectionId") Long sectionId) throws Exception {
            return new ResponseEntity<>(videoService.saveVideo(title, file, sectionId), HttpStatus.OK);
    }

    @GetMapping("/video/{sectionId}")
    public ResponseEntity<List<VideoResponseDTO>> getVideosBSectionId(@PathVariable Long sectionId) {
        return new ResponseEntity<>(videoService.getVideosBSectionId(sectionId), HttpStatus.OK);

    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getVideo(@PathVariable Long id) {
        VideoFile video = videoService.getVideo(id);
        return ResponseEntity.ok()
                .contentType(MediaType.valueOf(video.getType()))
                .body(video.getData());
    }

}

