"""create ai_interviews table

Revision ID: b0025f2f150f
Revises: a0015f1f140e
Create Date: 2025-11-05 15:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'b0025f2f150f'
down_revision: Union[str, Sequence[str], None] = 'a0015f1f140e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('ai_interviews',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('application_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('session_id', sa.String(length=255), nullable=False),
        sa.Column('status', sa.Enum('INITIATED', 'IN_PROGRESS', 'COMPLETED', 'TIMEOUT', 'ERROR', name='interviewstatus'), nullable=True),
        sa.Column('resume_blob_name', sa.String(length=500), nullable=False),
        sa.Column('jd_content', sa.Text(), nullable=False),
        sa.Column('candidate_name', sa.String(length=255), nullable=True),
        sa.Column('position', sa.String(length=255), nullable=True),
        sa.Column('questions', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('responses', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('report_url', sa.String(length=500), nullable=True),
        sa.Column('overall_score', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['application_id'], ['applications.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('session_id')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('ai_interviews')
    op.execute('DROP TYPE interviewstatus')
