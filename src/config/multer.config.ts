import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';

export const multerConfig = {
	dest: './public',
};

export const multerOptions = {
	// // Enable file size limits
	// limits: {
	// 	fileSize: +process.env.MAX_FILE_SIZE,
	// },
	// // Check the mimetypes to allow for upload
	// fileFilter: (req: any, file: any, cb: any) => {
	// 	if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
	// 		// Allow storage of file
	// 		cb(null, true);
	// 	} else {
	// 		// Reject file
	// 		cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
	// 	}
	// },

	storage: diskStorage({
		destination: (req, file, callback) => {
			const uploadPath = multerConfig.dest;

			if (!existsSync(uploadPath)) {
				mkdirSync(uploadPath);
			}

			callback(null, uploadPath);
		},
		filename: (req, file, callback) => {
			callback(null, `${Date.now() + file.originalname}`);
		},
	}),
};
