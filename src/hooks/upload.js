import { useState } from "react";
import pkgcloud from "pkgcloud";

export function audioUploader() {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const config = {
        provider: 'openstack',
        username: 'b3nliang@gmail.com',
        password: '!V8L8u645',
        authUrl: 'https://identity.cloud.sdsc.edu:5000/v3'
    }

    const client = pkgcloud.storage.createClient(config);

    async function uploadFile(file) {
        setUploading(true);
        setProgress(0);
        
        try {
            const containerName = 'myContainer';
            const container = client.getContainer(containerName);

            const fileOpt = {
                container: containerName,
                remote: file.name
            }

            const uploadStream = client.upload(fileOpt);

            uploadStream.on('error', (err) => {
                console.error('Error uploading');
                setUploading(false);
            });

            uploadStream.on('progress', (progressData) => {
                const percentage = Math.round((progressData.transferred / progressData.total) * 100);
                setProgress(percentage);
            });

            const fileStream = file.stream();
            fileStream.pipe(uploadStream);

            await new Promise((resolve) => {
                uploadStream.on('end', () => {
                    resolve();
                });
            });

            setUploading(false);
        } catch(err) {
            console.error('Error during audio upload:', err);
            setUploading(false);
        }

    } 
    return { uploading, progress, uploadFile };
}