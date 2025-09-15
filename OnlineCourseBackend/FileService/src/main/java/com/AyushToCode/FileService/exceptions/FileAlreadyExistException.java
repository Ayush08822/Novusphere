package com.AyushToCode.FileService.exceptions;

public class FileAlreadyExistException extends RuntimeException {
    public FileAlreadyExistException(String message) {
        super(message);
    }
}
