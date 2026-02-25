"""Initial migration

Create users, tasks, and workflows tables
Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('username', sa.String(100), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('is_superuser', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), default=sa.func.utcnow()),
        sa.Column('updated_at', sa.DateTime(timezone=True), default=sa.func.utcnow(), onupdate=sa.func.utcnow()),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_username', 'users', ['username'], unique=True)

    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('task_type', sa.Enum('image_generation', 'video_generation', 'music_generation', 'tts', 'workflow', name='tasktype'), nullable=False),
        sa.Column('status', sa.Enum('pending', 'running', 'success', 'failed', 'cancelled', name='taskstatus'), nullable=False),
        sa.Column('priority', sa.Integer(), default=5),
        sa.Column('input_data', sa.JSON(), nullable=False),
        sa.Column('output_data', sa.JSON()),
        sa.Column('output_urls', sa.JSON()),
        sa.Column('progress', sa.Integer(), default=0),
        sa.Column('progress_message', sa.Text()),
        sa.Column('error_message', sa.Text()),
        sa.Column('error_details', sa.JSON()),
        sa.Column('provider', sa.String(50)),
        sa.Column('model', sa.String(100)),
        sa.Column('fallback_used', sa.Boolean(), default=False),
        sa.Column('attempts', sa.Integer(), default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), default=sa.func.utcnow()),
        sa.Column('started_at', sa.DateTime(timezone=True)),
        sa.Column('completed_at', sa.DateTime(timezone=True)),
        sa.Column('celery_task_id', sa.String(255)),
    )
    op.create_index('ix_tasks_user_id', 'tasks', ['user_id'])
    op.create_index('ix_tasks_status', 'tasks', ['status'])
    op.create_index('ix_tasks_created_at', 'tasks', ['created_at'])
    op.create_index('ix_tasks_celery_task_id', 'tasks', ['celery_task_id'])

    # Create workflows table
    op.create_table(
        'workflows',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('status', sa.Enum('draft', 'in_progress', 'review', 'completed', 'cancelled', name='workflowstatus'), nullable=False),
        sa.Column('current_step', sa.Enum('story', 'script', 'config', 'character', 'shots', 'edit', name='workflowstep'), nullable=False),
        sa.Column('story_data', sa.JSON()),
        sa.Column('script_data', sa.JSON()),
        sa.Column('config_data', sa.JSON()),
        sa.Column('character_data', sa.JSON()),
        sa.Column('shots_data', sa.JSON()),
        sa.Column('edit_data', sa.JSON()),
        sa.Column('asset_urls', sa.JSON()),
        sa.Column('total_duration', sa.Integer()),
        sa.Column('estimated_cost', sa.String(50)),
        sa.Column('created_at', sa.DateTime(timezone=True), default=sa.func.utcnow()),
        sa.Column('updated_at', sa.DateTime(timezone=True), default=sa.func.utcnow(), onupdate=sa.func.utcnow()),
        sa.Column('completed_at', sa.DateTime(timezone=True)),
    )
    op.create_index('ix_workflows_user_id', 'workflows', ['user_id'])
    op.create_index('ix_workflows_status', 'workflows', ['status'])
    op.create_index('ix_workflows_created_at', 'workflows', ['created_at'])


def downgrade() -> None:
    op.drop_index('ix_workflows_created_at', table_name='workflows')
    op.drop_index('ix_workflows_status', table_name='workflows')
    op.drop_index('ix_workflows_user_id', table_name='workflows')
    op.drop_table('workflows')

    op.drop_index('ix_tasks_celery_task_id', table_name='tasks')
    op.drop_index('ix_tasks_created_at', table_name='tasks')
    op.drop_index('ix_tasks_status', table_name='tasks')
    op.drop_index('ix_tasks_user_id', table_name='tasks')
    op.drop_table('tasks')

    op.drop_index('ix_users_username', table_name='users')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')

    # Drop enums
    op.execute('DROP TYPE IF EXISTS workflowstep')
    op.execute('DROP TYPE IF EXISTS workflowstatus')
    op.execute('DROP TYPE IF EXISTS taskstatus')
    op.execute('DROP TYPE IF EXISTS tasktype')
