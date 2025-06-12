"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2024-02-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy_utils import ChoiceType

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # Create candidate_profiles table
    op.create_table('candidate_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('phone', sa.String(), nullable=True),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('github_url', sa.String(), nullable=True),
        sa.Column('kaggle_url', sa.String(), nullable=True),
        sa.Column('linkedin_url', sa.String(), nullable=True),
        sa.Column('big_number', sa.String(), nullable=True),
        sa.Column('kyc_file_path', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_candidate_profiles_id'), 'candidate_profiles', ['id'], unique=False)

    # Create candidate_skills table
    op.create_table('candidate_skills',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('profile_id', sa.Integer(), nullable=True),
        sa.Column('skill_name', sa.String(), nullable=False),
        sa.Column('level', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['profile_id'], ['candidate_profiles.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_candidate_skills_id'), 'candidate_skills', ['id'], unique=False)

    # Create vacancies table
    op.create_table('vacancies',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('branch', sa.String(), nullable=False),
        sa.Column('location', sa.String(), nullable=False),
        sa.Column('duration', sa.String(), nullable=False),
        sa.Column('rate_min', sa.Integer(), nullable=False),
        sa.Column('rate_max', sa.Integer(), nullable=False),
        sa.Column('big_number', sa.String(), nullable=True),
        sa.Column('kyc_file_path', sa.String(), nullable=True),
        sa.Column('availability', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_vacancies_id'), 'vacancies', ['id'], unique=False)
    op.create_index(op.f('ix_vacancies_title'), 'vacancies', ['title'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_vacancies_title'), table_name='vacancies')
    op.drop_index(op.f('ix_vacancies_id'), table_name='vacancies')
    op.drop_table('vacancies')
    op.drop_index(op.f('ix_candidate_skills_id'), table_name='candidate_skills')
    op.drop_table('candidate_skills')
    op.drop_index(op.f('ix_candidate_profiles_id'), table_name='candidate_profiles')
    op.drop_table('candidate_profiles')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')