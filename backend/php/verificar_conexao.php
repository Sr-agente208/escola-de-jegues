<?php
declare(strict_types=1);

// Ferramenta de diagnóstico local; não é um endpoint HTTP.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
require_once __DIR__ . '/conexao.php';

try {
    if (!extension_loaded('pdo_pgsql')) {
        throw new RuntimeException('A extensão pdo_pgsql não está instalada.');
    }
    $pdo = conectarBanco();
    $pdo->query('SELECT 1')->fetchColumn();
    // Confirma que o esquema foi importado e que a conta tem acesso à view.
    $pdo->query('SELECT id_aluno FROM boletim LIMIT 1');
    echo "Conexão com o banco e acesso ao boletim funcionando.\n";
} catch (Throwable $erro) {
    // Não imprimir detalhes da conexão, que podem conter informações sensíveis.
    fwrite(STDERR, "Não foi possível verificar a conexão ou o acesso ao boletim. " .
        "Confira pdo_pgsql, as variáveis DB_*, os privilégios e a importação do esquema.\n");
    exit(1);
}
