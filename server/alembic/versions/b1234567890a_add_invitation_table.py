"""add invitation table

Revision ID: b1234567890a
Revises: a0015f1f140e
Create Date: 2025-10-27 11:29:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision: str = 'b1234567890a'
down_revision: Union[str, Sequence[str], None] = 'a0015f1f140e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('invitations',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('client_id', UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('role', sa.Enum('EMPLOYEE', 'MANAGER', 'RECRUITER', name='invitationrole'), nullable=False),
        sa.Column('token', sa.String(length=500), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'ACCEPTED', 'EXPIRED', name='invitationstatus'), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['client_id'], ['public.clients.id'], ),
        schema='public'
    )
    op.create_index(op.f('ix_invitations_client_id'), 'invitations', ['client_id'], unique=False, schema='public')
    op.create_index(op.f('ix_invitations_email'), 'invitations', ['email'], unique=False, schema='public')
    op.create_index(op.f('ix_invitations_token'), 'invitations', ['token'], unique=True, schema='public')


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_invitations_token'), table_name='invitations', schema='public')
    op.drop_index(op.f('ix_invitations_email'), table_name='invitations', schema='public')
    op.drop_index(op.f('ix_invitations_client_id'), table_name='invitations', schema='public')
    op.drop_table('invitations', schema='public')
    op.execute('DROP TYPE invitationstatus')
    op.execute('DROP TYPE invitationrole')
