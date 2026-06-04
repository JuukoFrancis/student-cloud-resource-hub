"""
Azure Blob Storage utility for Cloud Academic Resource Hub.
Handles file upload, download URL generation, and deletion.
"""

import os
import logging
from azure.storage.blob import BlobServiceClient, ContentSettings
from azure.core.exceptions import AzureError

logger = logging.getLogger(__name__)


class AzureBlobStorage:
    """Wrapper around Azure Blob Storage for resource file management."""

    def __init__(self, connection_string=None, container_name=None):
        self.connection_string = connection_string or os.getenv('AZURE_STORAGE_CONNECTION_STRING')
        self.container_name = container_name or os.getenv('AZURE_CONTAINER_NAME', 'resources')
        self._client = None
        self._container_client = None

    @property
    def client(self):
        """Lazy-initialize the BlobServiceClient."""
        if self._client is None:
            if not self.connection_string:
                logger.warning('Azure Storage connection string not configured.')
                return None
            self._client = BlobServiceClient.from_connection_string(
                self.connection_string
            )
        return self._client

    @property
    def container_client(self):
        """Lazy-initialize the ContainerClient and create container if needed."""
        if self._container_client is None:
            if self.client is None:
                return None
            self._container_client = self.client.get_container_client(
                self.container_name
            )
            try:
                self._container_client.create_container()
                logger.info(f'Created container: {self.container_name}')
            except AzureError:
                # Container already exists
                pass
        return self._container_client

    def upload_file(self, file_data, blob_name, content_type=None):
        """
        Upload a file to Azure Blob Storage.

        Args:
            file_data: File-like object or bytes.
            blob_name: Name for the blob in the container.
            content_type: MIME type of the file.

        Returns:
            str: URL of the uploaded blob, or None on failure.
        """
        if self.container_client is None:
            logger.error('Cannot upload: Azure Blob Storage not configured.')
            return None

        try:
            blob_client = self.container_client.get_blob_client(blob_name)

            content_settings = None
            if content_type:
                content_settings = ContentSettings(content_type=content_type)

            blob_client.upload_blob(
                file_data,
                overwrite=True,
                content_settings=content_settings,
            )

            url = blob_client.url
            logger.info(f'Uploaded blob: {blob_name} -> {url}')
            return url

        except AzureError as e:
            logger.error(f'Failed to upload blob {blob_name}: {e}')
            return None

    def get_download_url(self, blob_name):
        """
        Get the URL for a blob (for read access).

        Args:
            blob_name: Name of the blob.

        Returns:
            str: URL of the blob, or None on failure.
        """
        if self.container_client is None:
            return None

        try:
            blob_client = self.container_client.get_blob_client(blob_name)
            return blob_client.url
        except AzureError as e:
            logger.error(f'Failed to get URL for blob {blob_name}: {e}')
            return None

    def delete_file(self, blob_name):
        """
        Delete a blob from Azure Blob Storage.

        Args:
            blob_name: Name of the blob to delete.

        Returns:
            bool: True if deleted, False on failure.
        """
        if self.container_client is None:
            logger.error('Cannot delete: Azure Blob Storage not configured.')
            return False

        try:
            blob_client = self.container_client.get_blob_client(blob_name)
            blob_client.delete_blob()
            logger.info(f'Deleted blob: {blob_name}')
            return True
        except AzureError as e:
            logger.error(f'Failed to delete blob {blob_name}: {e}')
            return False


# Singleton instance for convenience
azure_storage = AzureBlobStorage()


def get_content_type(filename):
    """Return the content type based on file extension."""
    ext = filename.lower().split('.')[-1] if '.' in filename else ''
    content_types = {
        'pdf': 'application/pdf',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'zip': 'application/zip',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
    }
    return content_types.get(ext, 'application/octet-stream')
