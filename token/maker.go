package token

import (
	"fmt"
	"time"

	"github.com/aead/chacha20poly1305"
	"github.com/o1egl/paseto"
)

type PasetoMaker struct {
	paseto       *paseto.V2
	symmetricKey []byte
}
type Maker interface {
	CreateToken(email string, role string, duration time.Duration) (string, error)
	VerifyToken(token string) (*Payload, error)
}

func (maker *PasetoMaker) CreateToken(email string, role string, duration time.Duration) (string, error) {
	payload, err := NewPayload(email, role, duration)
	if err != nil {
		return "", err
	}
	token, err := maker.paseto.Encrypt(maker.symmetricKey, payload, nil)
	if err != nil {
		return "", err
	}
	return token, nil
}
func (maker *PasetoMaker) VerifyToken(token string) (*Payload, error) {
	payload := &Payload{}
	err := maker.paseto.Decrypt(token, maker.symmetricKey, payload, nil)
	if err != nil {
		return nil, err
	}
	if err := payload.Valid(); err != nil {
		return nil, err
	}
	return payload, nil
}

func NewPasetoMaker(symmetricKey []byte) (Maker, error) {
	fmt.Println(len(symmetricKey))
	if len(symmetricKey) != chacha20poly1305.KeySize {
		return nil, fmt.Errorf("invalid key size: must be exactly 32 bytes")
	}
	paseto := paseto.NewV2()
	return &PasetoMaker{
		paseto:       paseto,
		symmetricKey: symmetricKey,
	}, nil

}
