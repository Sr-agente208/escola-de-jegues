"""Operações restritas para o PostgreSQL do Supabase."""
import os
from decimal import Decimal, InvalidOperation


def connection():
    import psycopg
    from psycopg.rows import dict_row
    required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']
    if any(not os.environ.get(k) for k in required):
        raise RuntimeError('Banco não configurado')
    return psycopg.connect(
        host=os.environ['DB_HOST'], port=int(os.environ.get('DB_PORT', '5432')),
        user=os.environ['DB_USER'], password=os.environ['DB_PASSWORD'],
        dbname=os.environ['DB_NAME'], sslmode='verify-full',
        sslrootcert=os.environ.get('DB_SSL_ROOT_CERT', '/etc/ssl/certs/ca-certificates.crt'),
        connect_timeout=5, row_factory=dict_row,
    )


def overview():
    with connection() as db:
        with db.cursor() as cur:
            counts = {}
            for table in ('alunos', 'professores', 'convidados', 'turmas', 'disciplinas', 'notas'):
                cur.execute('SELECT COUNT(*) AS total FROM ' + table)
                counts[table] = cur.fetchone()['total']
            cur.execute('''SELECT n.id_nota, a.nome AS aluno, d.nome AS disciplina,
                           n.bimestre, n.valor, n.atualizado_em
                           FROM notas n JOIN alunos a ON a.id_aluno=n.id_aluno
                           JOIN disciplinas d ON d.id_disciplina=n.id_disciplina
                           ORDER BY n.id_nota DESC LIMIT 100''')
            rows = cur.fetchall()
            for row in rows:
                row['valor'] = str(row['valor'])
                row['atualizado_em'] = str(row['atualizado_em'])
            return {'contagens': counts, 'notas': rows}


def update_grade(note_id, value):
    if isinstance(value, bool) or not isinstance(value, (str, int, float)):
        raise ValueError('Nota inválida.')
    try:
        grade = Decimal(str(value))
        if not grade.is_finite() or grade < 0 or grade > 10 or grade.as_tuple().exponent < -2:
            raise ValueError('A nota deve estar entre 0 e 10, com até duas casas decimais.')
    except InvalidOperation:
        raise ValueError('Nota inválida.')
    with connection() as db:
        with db.cursor() as cur:
            cur.execute('SELECT id_nota FROM notas WHERE id_nota=%s FOR UPDATE', (note_id,))
            if not cur.fetchone():
                raise LookupError('Nota não encontrada.')
            cur.execute('UPDATE notas SET valor=%s WHERE id_nota=%s', (grade, note_id))
        db.commit()
