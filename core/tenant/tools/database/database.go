package database

import (
	"database/sql"
	"errors"
	"fmt"

	"tenant/config"

	_ "github.com/go-sql-driver/mysql"
)

type DBType string

const (
	MYSQL DBType = "mysql"
)

type Database struct {
	mysql *sql.DB
}

func NewDatabase(conf *config.Config) (*Database, error) {
	if conf == nil || len(conf.DataBase.DBType) == 0 {
		return nil, errors.New("database config is nil or dbType is empty")
	}
	dbType := DBType(conf.DataBase.DBType)
	db := &Database{}
	switch dbType {
	case MYSQL:
		err := db.buildMysql(conf)
		if err != nil {
			return nil, err
		}
		return db, nil
	default:
		return nil, fmt.Errorf("unsupported dbType: %s", conf.DataBase.DBType)
	}
}

func (db *Database) buildMysql(conf *config.Config) error {
	if len(conf.DataBase.UserName) == 0 {
		return errors.New("mysql username is empty")
	}

	if len(conf.DataBase.Password) == 0 {
		return errors.New("mysql password is empty")
	}

	if len(conf.DataBase.Url) == 0 {
		return errors.New("mysql url is empty")
	}

	client, err := sql.Open("mysql",
		fmt.Sprintf("%s:%s@tcp%s", conf.DataBase.UserName, conf.DataBase.Password, conf.DataBase.Url))
	if err != nil {
		return err
	}
	client.SetMaxOpenConns(conf.DataBase.MaxOpenConns)
	client.SetMaxIdleConns(conf.DataBase.MaxIdleConns)
	err = client.Ping()
	if err != nil {
		return err
	}
	db.mysql = client
	return nil
}

func (db *Database) GetMysql() *sql.DB {
	return db.mysql
}
