package com.AyushToCode.FileService.controller;

import com.AyushToCode.FileService.DTO.ResponseDTO;
import com.AyushToCode.FileService.entity.File;
import com.AyushToCode.FileService.service.FileService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@AllArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<List<ResponseDTO>> uploadFile(@RequestParam("title") String title, @RequestParam("files") MultipartFile[] files , @RequestParam("sectionId") Long sectionId) throws Exception {
        return new ResponseEntity<>(fileService.saveResource(title, files, sectionId), HttpStatus.OK);
    }

//    @GetMapping("/{id}")
//    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id) {
//        File resource = fileService.getResource(id);
//        return ResponseEntity.ok()
//                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getName() + "\"")
//                .contentType(MediaType.parseMediaType(resource.getType()))
//                .body(resource.getData());
//    }

    @GetMapping("/{sectionId}")
    public ResponseEntity<List<ResponseDTO>> getFilesBySectionId(@PathVariable Long sectionId) {
        try {
            return new ResponseEntity<>(fileService.getFilesBySectionId(sectionId) , HttpStatus.OK);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
