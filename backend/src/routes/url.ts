import express, { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { Url } from '../models/Url';

export const urlRouter = express.Router();

// Create a short URL
urlRouter.post('/shorten', async (req: Request, res: Response) : Promise<any> => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: 'Please provide a URL' });
  }

  try {
    // Check if URL already exists in the database
    let url = await Url.findOne({ originalUrl });

    if (url) {
      return res.json(url);
    }

    // Create a new URL code
    const urlCode = nanoid(8);
    const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
    const shortUrl = `${baseUrl}/api/${urlCode}`;

    url = new Url({
      originalUrl,
      shortUrl,
      urlCode,
      createdAt: new Date(),
    });

    await url.save();
    res.json(url);
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Get all URLs
urlRouter.get('/geturl', async (req: Request, res: Response) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });
    res.json({status:'ok',urlData:urls});
  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Redirect to the original URL
urlRouter.get('/:code', async (req: Request, res: Response):Promise<any> => {
  console.log("got re code")
  try {
    const url = await Url.findOne({ urlCode: req.params.code });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Increment click count
    url.clicks += 1;
    await url.save();

    return res.redirect(url.originalUrl);
  } catch (error) {
    console.error('Error redirecting to URL:', error);
    res.status(500).json({ error: 'Server error' });
  }
});