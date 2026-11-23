<?php
declare(strict_types=1);
require_once __DIR__ . '/conexao.php';

/** Retorna o boletim de um aluno. O chamador deve verificar sua permissão. */
function buscarBoletim(PDO $pdo, int $idAluno): array
{
    $consulta = $pdo->prepare('SELECT * FROM boletim WHERE id_aluno = ? ORDER BY disciplina');
    $consulta->execute([$idAluno]);
    return $consulta->fetchAll();
}

/** Lança uma nota para uma disciplina atribuída ao professor na turma atual do aluno.
 * O chamador deve autenticar e autorizar o professor antes de chamar esta função.
 */
function lancarNota(PDO $pdo, int $idAluno, int $idDisciplina, int $idProfessor, int $bimestre, float $valor): int
{
    if ($idAluno <= 0 || $idDisciplina <= 0 || $idProfessor <= 0 ||
        $bimestre < 1 || $bimestre > 4 || !is_finite($valor) || $valor < 0 || $valor > 10) {
        throw new InvalidArgumentException('Dados da nota inválidos.');
    }
    $sql = 'INSERT INTO notas (id_aluno, id_disciplina, id_professor, bimestre, valor)
            SELECT a.id_aluno, td.id_disciplina, td.id_professor, ?, ?
            FROM alunos a JOIN turmas_disciplinas td ON td.id_turma = a.id_turma
            WHERE a.id_aluno = ? AND td.id_disciplina = ? AND td.id_professor = ? RETURNING id_nota';
    $consulta = $pdo->prepare($sql);
    $consulta->execute([$bimestre, $valor, $idAluno, $idDisciplina, $idProfessor]);
    $idNota = $consulta->fetchColumn();
    if ($idNota === false) {
        throw new DomainException('Professor ou disciplina não atribuído à turma do aluno.');
    }
    return (int)$idNota;
}
