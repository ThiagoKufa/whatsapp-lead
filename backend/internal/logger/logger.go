package logger

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"time"
)

// LogLevel define os níveis de log
type LogLevel int

const (
	DEBUG LogLevel = iota
	INFO
	WARNING
	ERROR
)

// Log representa uma entrada de log
type Log struct {
	Timestamp string      `json:"timestamp"`
	Level     string      `json:"level"`
	Message   string      `json:"message"`
	File      string      `json:"file"`
	Line      int         `json:"line"`
	Data      interface{} `json:"data,omitempty"`
}

// LogToFile salva os logs de erro em arquivo JSON
func LogToFile(level LogLevel, message string, data interface{}) {
	// Cria o diretório de logs se não existir
	os.MkdirAll("logs", os.ModePerm)

	// Apenas salva em arquivo os logs de erro
	if level == ERROR {
		_, file, line, _ := runtime.Caller(1)

		log := Log{
			Timestamp: time.Now().Format(time.RFC3339),
			Level:     getLevelName(level),
			Message:   message,
			File:      filepath.Base(file),
			Line:      line,
			Data:      data,
		}

		// Gera o nome do arquivo com timestamp para evitar sobrescrever
		fileName := fmt.Sprintf("logs/error_%s.json", time.Now().Format("20060102_150405"))

		// Converte para JSON
		jsonData, err := json.MarshalIndent(log, "", "  ")
		if err != nil {
			fmt.Printf("Erro ao converter log para JSON: %v\n", err)
			return
		}

		// Escreve no arquivo
		err = os.WriteFile(fileName, jsonData, 0644)
		if err != nil {
			fmt.Printf("Erro ao escrever log no arquivo: %v\n", err)
		}
	}

	// Sempre loga no console
	logToConsole(level, message, data)
}

// logToConsole imprime logs no console
func logToConsole(level LogLevel, message string, data interface{}) {
	_, file, line, _ := runtime.Caller(2)

	timestamp := time.Now().Format("2006-01-02 15:04:05")
	levelName := getLevelName(level)

	fmt.Printf("[%s] [%s] %s (%s:%d)", timestamp, levelName, message, filepath.Base(file), line)

	if data != nil {
		fmt.Printf(" - Data: %+v", data)
	}

	fmt.Println()
}

// getLevelName retorna o nome do nível de log
func getLevelName(level LogLevel) string {
	switch level {
	case DEBUG:
		return "DEBUG"
	case INFO:
		return "INFO"
	case WARNING:
		return "WARNING"
	case ERROR:
		return "ERROR"
	default:
		return "UNKNOWN"
	}
}

// Debug loga mensagens de debug
func Debug(message string, data ...interface{}) {
	var dataObj interface{}
	if len(data) > 0 {
		dataObj = data[0]
	}
	LogToFile(DEBUG, message, dataObj)
}

// Info loga mensagens informativas
func Info(message string, data ...interface{}) {
	var dataObj interface{}
	if len(data) > 0 {
		dataObj = data[0]
	}
	LogToFile(INFO, message, dataObj)
}

// Warning loga avisos
func Warning(message string, data ...interface{}) {
	var dataObj interface{}
	if len(data) > 0 {
		dataObj = data[0]
	}
	LogToFile(WARNING, message, dataObj)
}

// Error loga erros
func Error(message string, data ...interface{}) {
	var dataObj interface{}
	if len(data) > 0 {
		dataObj = data[0]
	}
	LogToFile(ERROR, message, dataObj)
}
