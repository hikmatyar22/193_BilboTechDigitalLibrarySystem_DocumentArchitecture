const axios = require('axios');

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

class GoogleBooksService {
  /**
   * Search buku berdasarkan query
   * @param {string} query - Kata kunci pencarian
   * @param {number} maxResults - Jumlah hasil (default: 20)
   * @param {number} startIndex - Pagination offset (default: 0)
   * @returns {Promise<Object>}
   */
  async searchBooks(query, maxResults = 20, startIndex = 0) {
    try {
      const response = await axios.get(GOOGLE_BOOKS_API, {
        params: {
          q: query,
          maxResults: maxResults,
          startIndex: startIndex,
          langRestrict: 'id', // Prioritas bahasa Indonesia (bisa dihapus jika ingin semua bahasa)
          printType: 'books'
        }
      });

      return {
        success: true,
        totalItems: response.data.totalItems || 0,
        items: this.formatBooks(response.data.items || [])
      };
    } catch (error) {
      console.error('Google Books API Error:', error.message);
      return {
        success: false,
        message: 'Gagal mengambil data dari Google Books API',
        error: error.message
      };
    }
  }

  /**
   * Get detail buku berdasarkan ID
   * @param {string} bookId - ID buku dari Google Books
   * @returns {Promise<Object>}
   */
  async getBookById(bookId) {
    try {
      const response = await axios.get(`${GOOGLE_BOOKS_API}/${bookId}`);
      
      return {
        success: true,
        data: this.formatBook(response.data)
      };
    } catch (error) {
      console.error('Google Books API Error:', error.message);
      return {
        success: false,
        message: 'Buku tidak ditemukan',
        error: error.message
      };
    }
  }

  /**
   * Search buku berdasarkan kategori
   * @param {string} category - Kategori buku (fiction, technology, history, dll)
   * @param {number} maxResults
   * @param {number} startIndex
   * @returns {Promise<Object>}
   */
  async getBooksByCategory(category, maxResults = 20, startIndex = 0) {
    try {
      const response = await axios.get(GOOGLE_BOOKS_API, {
        params: {
          q: `subject:${category}`,
          maxResults: maxResults,
          startIndex: startIndex,
          orderBy: 'relevance'
        }
      });

      return {
        success: true,
        category: category,
        totalItems: response.data.totalItems || 0,
        items: this.formatBooks(response.data.items || [])
      };
    } catch (error) {
      console.error('Google Books API Error:', error.message);
      return {
        success: false,
        message: 'Gagal mengambil data kategori',
        error: error.message
      };
    }
  }

  /**
   * Format data buku dari Google Books API
   * @param {Object} book - Raw data dari API
   * @returns {Object}
   */
  formatBook(book) {
    const volumeInfo = book.volumeInfo || {};
    
    return {
      id: book.id,
      title: volumeInfo.title || 'Tanpa Judul',
      authors: volumeInfo.authors || [],
      publisher: volumeInfo.publisher || 'Tidak diketahui',
      publishedDate: volumeInfo.publishedDate || null,
      description: volumeInfo.description || 'Tidak ada deskripsi',
      pageCount: volumeInfo.pageCount || 0,
      categories: volumeInfo.categories || [],
      averageRating: volumeInfo.averageRating || 0,
      ratingsCount: volumeInfo.ratingsCount || 0,
      language: volumeInfo.language || 'unknown',
      thumbnail: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || null,
      previewLink: volumeInfo.previewLink || null,
      infoLink: volumeInfo.infoLink || null
    };
  }

  /**
   * Format array buku
   * @param {Array} books
   * @returns {Array}
   */
  formatBooks(books) {
    return books.map(book => this.formatBook(book));
  }
}

module.exports = new GoogleBooksService();