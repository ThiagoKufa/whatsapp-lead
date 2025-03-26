package entity

import (
	"time"

	"golang.org/x/crypto/bcrypt"
)

// User representa um usuário no sistema
type User struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Password  string    `json:"-"` // O campo password não é serializado para JSON
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// HashPassword cria um hash da senha do usuário
func (u *User) HashPassword() error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)
	return nil
}

// ComparePassword verifica se a senha fornecida corresponde ao hash armazenado
func (u *User) ComparePassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}

// NewUser cria uma nova instância de usuário
func NewUser(name, email, password string) (*User, error) {
	user := &User{
		Name:      name,
		Email:     email,
		Password:  password,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := user.HashPassword(); err != nil {
		return nil, err
	}

	return user, nil
}
