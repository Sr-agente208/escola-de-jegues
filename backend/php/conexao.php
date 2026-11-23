<?php
declare(strict_types=1);

/** Conexão PostgreSQL privada; variáveis configuradas no servidor. */
function conectarBanco(): PDO
{
    $host = getenv('DB_HOST');
    $banco = getenv('DB_NAME');
    $usuario = getenv('DB_USER');
    $senha = getenv('DB_PASSWORD');
    $porta = getenv('DB_PORT') ?: '5432';
    if (!$host || !$banco || !$usuario || $senha === false || $senha === '' ||
        !ctype_digit($porta) || (int)$porta < 1 || (int)$porta > 65535 ||
        strpbrk($host . $banco, ";\r\n") !== false) {
        throw new RuntimeException('Configuração do banco ausente ou inválida.');
    }
    // A CA precisa ser acessível ao processo PHP.
    $ca = getenv('DB_SSL_ROOT_CERT') ?: '/etc/ssl/certs/ca-certificates.crt';
    if (strpbrk($ca, ";\r\n") !== false) {
        throw new RuntimeException('Caminho da CA inválido.');
    }
    $dsn = "pgsql:host=$host;port=$porta;dbname=$banco;sslmode=verify-full;sslrootcert=$ca";
    return new PDO($dsn, $usuario, $senha, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}
