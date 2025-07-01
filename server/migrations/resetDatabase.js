const { sequelize } = require('../config/database');
const User = require('../models/User');
const Product = require('../models/Product');
const Location = require('../models/Location');

async function resetDatabase() {
    try {
        console.log('🔄 Veritabanı sıfırlanıyor...');
        
        // Tabloları sil
        await sequelize.drop();
        console.log('✅ Mevcut tablolar silindi');
        
        // Tabloları yeniden oluştur
        await sequelize.sync({ force: true });
        console.log('✅ Yeni tablolar oluşturuldu');
        
        // Demo kullanıcıları ekle
        console.log('👥 Demo kullanıcıları ekleniyor...');
        
        const adminUser = await User.create({
            name: 'Admin Kullanıcı',
            email: 'admin@example.com',
            password: 'test1234',
            role: 'admin'
        });
        
        const normalUser1 = await User.create({
            name: 'Yılmaz KANAT',
            email: 'yilmaz@example.com',
            password: 'test1234',
            role: 'user'
        });
        
        const normalUser2 = await User.create({
            name: 'Bilal Arslan',
            email: 'bilal@example.com',
            password: 'test1234',
            role: 'user'
        });
        
        const normalUser3 = await User.create({
            name: 'Mehmet ',
            email: 'mehmet@example.com',
            password: 'test1234',
            role: 'user'
        });
        
        console.log('✅ Demo kullanıcıları eklendi');

        // Lokasyonları ekle
        console.log('📍 Lokasyonlar ekleniyor...');
        
        const locations = [
            { name: 'A-1 Rafı', description: 'Ana depo girişi sağ taraf, birinci raf', status: 'active' },
            { name: 'A-2 Rafı', description: 'Ana depo girişi sağ taraf, ikinci raf', status: 'active' },
            { name: 'B-1 Rafı', description: 'Ana depo girişi sol taraf, birinci raf', status: 'active' },
            { name: 'B-2 Rafı', description: 'Ana depo girişi sol taraf, ikinci raf', status: 'active' },
            { name: 'Ofis Dolabı', description: 'Ofis içerisindeki metal dolap', status: 'active' },
            { name: 'Teknik Servis', description: 'Teknik servis odasındaki raf sistemi', status: 'active' }
        ];

        for (const locationData of locations) {
            await Location.create(locationData);
        }

        console.log('✅ Lokasyonlar eklendi');
        
        // Demo ürünleri ekle (imageUrl: null)
        console.log('📦 Demo ürünleri ekleniyor...');
        
        const products = [
            {
                name: 'Dell Latitude 5520',
                description: 'Intel i7 11. nesil işlemci, 16GB RAM, 512GB SSD',
                features: 'Windows 11 Pro, 15.6" FHD ekran, webcam, WiFi 6',
                location: 'A-1 Rafı',
                category: 'laptop',
                barcode: '4711234567890',
                status: 'in_stock',
                imageUrl: null
            },
            {
                name: 'HP EliteBook 840',
                description: 'Intel i5 işlemci, 8GB RAM, 256GB SSD',
                features: 'Windows 11 Pro, 14" ekran, Bluetooth, USB-C',
                location: 'A-1 Rafı',
                category: 'laptop',
                barcode: '4711234567891',
                status: 'borrowed',
                borrowedBy: 'Yılmaz KANAT',
                borrowedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                imageUrl: null
            },
            {
                name: 'Apple MacBook Air M2',
                description: 'Apple M2 çip, 16GB RAM, 512GB SSD',
                features: 'macOS Ventura, 13.6" Liquid Retina ekran, Touch ID',
                location: 'A-2 Rafı',
                category: 'laptop',
                barcode: '4711234567892',
                status: 'in_stock',
                imageUrl: null
            },
            {
                name: 'Dell OptiPlex 7090',
                description: 'Intel i7 işlemci, 16GB RAM, 512GB SSD',
                features: 'Windows 11 Pro, küçük form faktör, WiFi',
                location: 'B-1 Rafı',
                category: 'desktop',
                barcode: '4711234567893',
                status: 'in_stock',
                imageUrl: null
            },
            {
                name: 'Samsung 27" 4K Monitor',
                description: '27 inç 4K UHD monitör, USB-C hub özelliği',
                features: 'HDR10, 60Hz, ayarlanabilir stand, pivot özelliği',
                location: 'B-2 Rafı',
                category: 'monitor',
                barcode: '4711234567894',
                status: 'borrowed',
                borrowedBy: 'Bilal Arslan',
                borrowedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                imageUrl: null
            },
            {
                name: 'LG UltraWide 34" Monitor',
                description: '34 inç ultrawide monitör, kavisli ekran',
                features: 'WQHD çözünürlük, 144Hz, HDR400, USB-C PD',
                location: 'B-2 Rafı',
                category: 'monitor',
                barcode: '4711234567895',
                status: 'in_stock',
                imageUrl: null
            },
            {
                name: 'HP LaserJet Pro 400',
                description: 'Siyah beyaz lazer yazıcı, çift taraflı baskı',
                features: 'WiFi, mobil baskı, 38 sayfa/dakika hız',
                location: 'Ofis Dolabı',
                category: 'printer',
                barcode: '4711234567896',
                status: 'in_stock',
                imageUrl: null
            },
            {
                name: 'iPad Air 5. Nesil',
                description: 'Apple M1 çip, 256GB WiFi model',
                features: '10.9" Liquid Retina ekran, Touch ID, Apple Pencil uyumlu',
                location: 'Ofis Dolabı',
                category: 'tablet',
                barcode: '4711234567897',
                status: 'borrowed',
                borrowedBy: 'Mehmet',
                borrowedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                imageUrl: null
            },
            {
                name: 'Cisco Catalyst Switch',
                description: '24 port Gigabit Ethernet switch',
                features: 'Layer 2 switching, PoE+, yönetilebilir',
                location: 'Teknik Servis',
                category: 'network',
                barcode: '4711234567898',
                status: 'in_stock',
                imageUrl: null
            },
            {
                name: 'Canon EOS R6 Mark II',
                description: 'Aynasız fotoğraf makinesi, 24.2MP',
                features: '4K video, IS stabilizasyon, WiFi, Bluetooth',
                location: 'A-1 Rafı',
                category: 'camera',
                barcode: '4711234567899',
                status: 'in_stock',
                imageUrl: null
            },
            {
                name: 'Logitech MX Master 3',
                description: 'Ergonomik wireless mouse, çok cihaz',
                features: 'MagSpeed scroll, 3 cihaz bağlantı, USB-C şarj',
                location: 'A-2 Rafı',
                category: 'accessory',
                barcode: '4711234567900',
                status: 'borrowed',
                borrowedBy: 'Admin Kullanıcı',
                borrowedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                imageUrl: null
            },
            {
                name: 'Anker USB-C Hub',
                description: '7-in-1 USB-C multiport adapter',
                features: 'HDMI 4K, USB 3.0 x3, SD/microSD, PD 100W',
                location: 'B-1 Rafı',
                category: 'accessory',
                barcode: '4711234567901',
                status: 'in_stock',
                imageUrl: null
            }
        ];
        
        // Ürünleri tek tek oluştur
        for (const productData of products) {
            await Product.create(productData);
        }
        
        console.log('✅ Demo ürünleri eklendi');
        
        console.log('\n🎉 Veritabanı başarıyla sıfırlandı ve demo veriler eklendi!');
        console.log('\n👥 Demo Kullanıcılar:');
        console.log('   📧 admin@example.com / test1234 (Admin)');
        console.log('   📧 bilal@example.com / test1234 (Kullanıcı)');
        console.log('   📧 yilmaz@example.com / test1234 (Kullanıcı)');
        console.log('   📧 mehmet@example.com / test1234 (Kullanıcı)');
        
        console.log('\n📦 Demo Ürünler:');
        console.log(`   📊 Toplam: ${products.length} ürün`);
        console.log(`   ✅ Depoda: ${products.filter(p => p.status === 'in_stock').length} ürün`);
        console.log(`   🔄 Ödünç alınan: ${products.filter(p => p.status === 'borrowed').length} ürün`);
        console.log('   🖼️  Tüm ürünlerin görseli: null (görsel yok)');
        
        console.log('\n📍 Lokasyonlar:');
        console.log('   📍 A-1 Rafı');
        console.log('   📍 A-2 Rafı');
        console.log('   📍 B-1 Rafı');
        console.log('   📍 B-2 Rafı');
        console.log('   📍 Ofis Dolabı');
        console.log('   📍 Teknik Servis');
        
        return {
            success: true,
            message: 'Veritabanı başarıyla sıfırlandı',
            stats: {
                totalProducts: products.length,
                inStockProducts: products.filter(p => p.status === 'in_stock').length,
                borrowedProducts: products.filter(p => p.status === 'borrowed').length,
                totalUsers: 4,
                totalLocations: locations.length
            }
        };
        
    } catch (error) {
        console.error('❌ Veritabanı sıfırlama hatası:', error);
        throw error;
    }
}

module.exports = { resetDatabase };

// Eğer script doğrudan çalıştırılıyorsa
if (require.main === module) {
    resetDatabase()
        .then(() => {
            console.log('\n✅ İşlem tamamlandı!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Hata:', error);
            process.exit(1);
        });
} 