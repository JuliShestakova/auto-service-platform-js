"""Initial database migration

Revision ID: a79988ddeebe
Revises:
Create Date: 2026-10-06 12:12:26.293712

"""

from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = "a79988ddeebe"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass