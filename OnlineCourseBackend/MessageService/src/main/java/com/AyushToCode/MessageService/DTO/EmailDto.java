package com.AyushToCode.MessageService.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class EmailDto {

    private String email;
    private List<String> allEmailOnCourseId;
}
