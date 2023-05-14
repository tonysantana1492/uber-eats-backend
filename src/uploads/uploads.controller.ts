import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/multer.config';
import * as AWS from 'aws-sdk';

@Controller('uploads')
export class UploadsController {
	constructor(private readonly configService: ConfigService) {}

	@Post('aws')
	@UseInterceptors(FileInterceptor('file'))
	async uploadFileAws(@UploadedFile() file) {
		const BUCKET_NAME = this.configService.get('BUCKET_NAME');

		AWS.config.update({
			credentials: {
				accessKeyId: this.configService.get('AWS_KEY'),
				secretAccessKey: this.configService.get('AWS_SECRET'),
			},
		});
		try {
			const objectName = `${Date.now() + file.originalname}`;
			await new AWS.S3()
				.putObject({
					Body: file.buffer,
					Bucket: BUCKET_NAME,
					Key: objectName,
					ACL: 'public-read',
				})
				.promise();
			const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${objectName}`;
			return { url };
		} catch (e) {
			return null;
		}
	}

	@Post('')
	@UseInterceptors(FileInterceptor('file', multerOptions))
	async uploadFile(@UploadedFile() file) {
		return { url: `${this.configService.get('APP_URL')}/${file.filename}` };
	}
}
