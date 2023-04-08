use crate::Result;
use config::{Environment, File};
use serde::Deserialize;
use sqlx::postgres::PgConnectOptions;
use sqlx::PgPool;
use std::net::IpAddr;
use std::path::PathBuf;

#[derive(Debug, Deserialize)]
pub struct Config {
    pub listen: Listen,
    pub database: DbConfig,
}

impl Config {
    pub fn load(path: &str) -> Result<Self> {
        let s = config::Config::builder()
            .add_source(File::with_name(path))
            .add_source(Environment::default().separator("_"))
            .build()?;

        Ok(s.try_deserialize()?)
    }
}

#[derive(Debug, Deserialize)]
pub struct DbConfig {
    hostname: String,
    username: String,
    password: String,
}

impl DbConfig {
    pub async fn connect(&self) -> Result<PgPool> {
        let opt = PgConnectOptions::new()
            .host(&self.hostname)
            .username(&self.username)
            .password(&self.password);
        Ok(PgPool::connect_with(opt).await?)
    }
}

#[derive(Debug, Deserialize)]
#[serde(untagged)]
pub enum Listen {
    Socket { path: PathBuf },
    Tcp { address: IpAddr, port: u16 },
}
