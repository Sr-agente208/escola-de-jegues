-- MySQL 8.0.16+ / MariaDB 10.2.1+. Execute em um banco vazio selecionado.
-- O banco e o usuário devem ser criados pelo administrador antes da importação.
CREATE TABLE turmas (
    id_turma BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    ano_letivo SMALLINT UNSIGNED NOT NULL,
    UNIQUE KEY uq_turma_ano (nome, ano_letivo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE professores (
    id_professor BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE alunos (
    id_aluno BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    matricula VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(254) NULL,
    id_turma BIGINT UNSIGNED NOT NULL,
    FOREIGN KEY (id_turma) REFERENCES turmas(id_turma) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cadastro de convidados, sem conceder acesso aos dados escolares.
CREATE TABLE convidados (
    id_convidado BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE disciplinas (
    id_disciplina BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Uma disciplina pode ter professores diferentes em cada turma.
CREATE TABLE turmas_disciplinas (
    id_turma BIGINT UNSIGNED NOT NULL,
    id_disciplina BIGINT UNSIGNED NOT NULL,
    id_professor BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (id_turma, id_disciplina),
    FOREIGN KEY (id_turma) REFERENCES turmas(id_turma) ON DELETE RESTRICT,
    FOREIGN KEY (id_disciplina) REFERENCES disciplinas(id_disciplina) ON DELETE RESTRICT,
    FOREIGN KEY (id_professor) REFERENCES professores(id_professor) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notas (
    id_nota BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_aluno BIGINT UNSIGNED NOT NULL,
    id_disciplina BIGINT UNSIGNED NOT NULL,
    id_professor BIGINT UNSIGNED NOT NULL,
    bimestre TINYINT UNSIGNED NOT NULL,
    valor DECIMAL(4,2) NOT NULL,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT ck_nota_valor CHECK (valor BETWEEN 0 AND 10),
    CONSTRAINT ck_nota_bimestre CHECK (bimestre BETWEEN 1 AND 4),
    UNIQUE KEY uq_nota (id_aluno, id_disciplina, bimestre),
    FOREIGN KEY (id_aluno) REFERENCES alunos(id_aluno) ON DELETE RESTRICT,
    FOREIGN KEY (id_disciplina) REFERENCES disciplinas(id_disciplina) ON DELETE RESTRICT,
    FOREIGN KEY (id_professor) REFERENCES professores(id_professor) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Boletim calculado: uma linha por aluno e disciplina, média dos bimestres lançados.
CREATE VIEW boletim AS
SELECT a.id_aluno, a.nome AS aluno, t.id_turma, t.nome AS turma, t.ano_letivo,
       d.id_disciplina, d.nome AS disciplina,
       MAX(CASE WHEN n.bimestre = 1 THEN n.valor END) AS bimestre_1,
       MAX(CASE WHEN n.bimestre = 2 THEN n.valor END) AS bimestre_2,
       MAX(CASE WHEN n.bimestre = 3 THEN n.valor END) AS bimestre_3,
       MAX(CASE WHEN n.bimestre = 4 THEN n.valor END) AS bimestre_4,
       ROUND(AVG(n.valor), 2) AS media,
       COUNT(n.id_nota) AS bimestres_lancados
FROM alunos a
JOIN turmas t ON t.id_turma = a.id_turma
JOIN notas n ON n.id_aluno = a.id_aluno
JOIN disciplinas d ON d.id_disciplina = n.id_disciplina
GROUP BY a.id_aluno, a.nome, t.id_turma, t.nome, t.ano_letivo, d.id_disciplina, d.nome;
