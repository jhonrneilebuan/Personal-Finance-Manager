import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import axios from 'axios';
import { env } from '../config/env';

type ImageUploadInput = {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
  folder: 'receipts' | 'avatars';
};

const sanitizeName = (value: string) => value.replace(/[^a-zA-Z0-9._-]/g, '-');

const uploadToCloudinary = async ({ buffer, mimeType, originalName, folder }: ImageUploadInput) => {
  if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
    return null;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `${folder}/${Date.now()}-${sanitizeName(path.parse(originalName).name || 'image')}`;
  const paramsToSign = `folder=pisopilot/${folder}&public_id=${publicId}&timestamp=${timestamp}${env.cloudinaryApiSecret}`;
  const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');
  const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;
  const body = new URLSearchParams({
    file: dataUri,
    api_key: env.cloudinaryApiKey,
    timestamp: String(timestamp),
    signature,
    folder: `pisopilot/${folder}`,
    public_id: publicId,
  });

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/upload`,
    body,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 25000,
    },
  );

  const secureUrl = (response.data as { secure_url?: unknown }).secure_url;
  if (typeof secureUrl !== 'string') throw new Error('Cloudinary upload did not return a URL');
  return secureUrl;
};

const saveLocal = async ({ buffer, originalName, folder }: ImageUploadInput) => {
  const directory = path.resolve(env.uploadDir, folder);
  await fs.mkdir(directory, { recursive: true });
  const extension = path.extname(originalName) || '.jpg';
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
  await fs.writeFile(path.join(directory, filename), buffer);
  return `/uploads/${folder}/${filename}`;
};

export const imageStorageService = {
  async uploadImage(input: ImageUploadInput) {
    const cloudUrl = await uploadToCloudinary(input);
    if (cloudUrl) return cloudUrl;
    return saveLocal(input);
  },
};
