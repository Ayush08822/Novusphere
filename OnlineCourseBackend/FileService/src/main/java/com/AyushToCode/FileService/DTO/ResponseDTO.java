package com.AyushToCode.FileService.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResponseDTO {
    private Long id;
    private String title;
    private String type;
    private byte[] data;
}
