package com.AyushToCode.CourseService.exceptions;

public class NoSuchSectionFoundException extends RuntimeException {
    public NoSuchSectionFoundException(String message) {
        super(message);
    }
}
