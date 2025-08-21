#!/usr/bin/env python3
"""
SocialCalc Database Tests
Tests for database operations and data integrity
"""

import pytest
import sqlite3
import tempfile
import os
from unittest.mock import Mock, patch


class TestDatabaseSetup:
    """Test database setup and initialization"""
    
    def test_create_test_database(self):
        """Test creating a test database"""
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp_db:
            db_path = tmp_db.name
        
        try:
            # Create test database
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Create test tables
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS UserSheets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user TEXT NOT NULL,
                    fname TEXT NOT NULL,
                    data TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user, fname)
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS StockTemplates (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user TEXT NOT NULL,
                    fname TEXT NOT NULL,
                    data TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user, fname)
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS SharedSheets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user TEXT NOT NULL,
                    fname TEXT NOT NULL,
                    data TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user, fname)
                )
            ''')
            
            conn.commit()
            
            # Verify tables exist
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row[0] for row in cursor.fetchall()]
            
            assert 'UserSheets' in tables
            assert 'StockTemplates' in tables
            assert 'SharedSheets' in tables
            
            conn.close()
            
        finally:
            # Cleanup
            if os.path.exists(db_path):
                os.unlink(db_path)


class TestUserSheetsOperations:
    """Test UserSheets table operations"""
    
    def setup_method(self):
        """Setup test database for each test"""
        self.db_fd, self.db_path = tempfile.mkstemp(suffix='.db')
        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()
        
        # Create UserSheets table
        self.cursor.execute('''
            CREATE TABLE UserSheets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user TEXT NOT NULL,
                fname TEXT NOT NULL,
                data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user, fname)
            )
        ''')
        self.conn.commit()
    
    def teardown_method(self):
        """Cleanup after each test"""
        self.conn.close()
        os.close(self.db_fd)
        os.unlink(self.db_path)
    
    def test_insert_user_sheet(self):
        """Test inserting a new user sheet"""
        user = "testuser"
        fname = "My Spreadsheet"
        data = "cell:A1:t:Hello World"
        
        self.cursor.execute(
            "INSERT INTO UserSheets (user, fname, data) VALUES (?, ?, ?)",
            (user, fname, data)
        )
        self.conn.commit()
        
        # Verify insertion
        self.cursor.execute(
            "SELECT user, fname, data FROM UserSheets WHERE user = ? AND fname = ?",
            (user, fname)
        )
        result = self.cursor.fetchone()
        
        assert result is not None
        assert result[0] == user
        assert result[1] == fname
        assert result[2] == data
    
    def test_update_user_sheet(self):
        """Test updating an existing user sheet"""
        user = "testuser"
        fname = "My Spreadsheet"
        initial_data = "cell:A1:t:Hello"
        updated_data = "cell:A1:t:Hello World"
        
        # Insert initial data
        self.cursor.execute(
            "INSERT INTO UserSheets (user, fname, data) VALUES (?, ?, ?)",
            (user, fname, initial_data)
        )
        self.conn.commit()
        
        # Update data
        self.cursor.execute(
            "UPDATE UserSheets SET data = ? WHERE user = ? AND fname = ?",
            (updated_data, user, fname)
        )
        self.conn.commit()
        
        # Verify update
        self.cursor.execute(
            "SELECT data FROM UserSheets WHERE user = ? AND fname = ?",
            (user, fname)
        )
        result = self.cursor.fetchone()
        
        assert result is not None
        assert result[0] == updated_data
    
    def test_delete_user_sheet(self):
        """Test deleting a user sheet"""
        user = "testuser"
        fname = "My Spreadsheet"
        data = "cell:A1:t:Hello World"
        
        # Insert data
        self.cursor.execute(
            "INSERT INTO UserSheets (user, fname, data) VALUES (?, ?, ?)",
            (user, fname, data)
        )
        self.conn.commit()
        
        # Delete data
        self.cursor.execute(
            "DELETE FROM UserSheets WHERE user = ? AND fname = ?",
            (user, fname)
        )
        self.conn.commit()
        
        # Verify deletion
        self.cursor.execute(
            "SELECT COUNT(*) FROM UserSheets WHERE user = ? AND fname = ?",
            (user, fname)
        )
        count = self.cursor.fetchone()[0]
        
        assert count == 0
    
    def test_list_user_sheets(self):
        """Test listing all sheets for a user"""
        user = "testuser"
        sheets = [
            ("Sheet1", "data1"),
            ("Sheet2", "data2"),
            ("Sheet3", "data3")
        ]
        
        # Insert multiple sheets
        for fname, data in sheets:
            self.cursor.execute(
                "INSERT INTO UserSheets (user, fname, data) VALUES (?, ?, ?)",
                (user, fname, data)
            )
        self.conn.commit()
        
        # Query all sheets for user
        self.cursor.execute(
            "SELECT fname, data FROM UserSheets WHERE user = ? ORDER BY fname",
            (user,)
        )
        results = self.cursor.fetchall()
        
        assert len(results) == 3
        assert results[0] == ("Sheet1", "data1")
        assert results[1] == ("Sheet2", "data2")
        assert results[2] == ("Sheet3", "data3")
    
    def test_unique_constraint(self):
        """Test unique constraint on user/fname combination"""
        user = "testuser"
        fname = "My Spreadsheet"
        data1 = "data1"
        data2 = "data2"
        
        # Insert first record
        self.cursor.execute(
            "INSERT INTO UserSheets (user, fname, data) VALUES (?, ?, ?)",
            (user, fname, data1)
        )
        self.conn.commit()
        
        # Try to insert duplicate - should fail
        with pytest.raises(sqlite3.IntegrityError):
            self.cursor.execute(
                "INSERT INTO UserSheets (user, fname, data) VALUES (?, ?, ?)",
                (user, fname, data2)
            )
            self.conn.commit()


class TestStockTemplatesOperations:
    """Test StockTemplates table operations"""
    
    def setup_method(self):
        """Setup test database for each test"""
        self.db_fd, self.db_path = tempfile.mkstemp(suffix='.db')
        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()
        
        # Create StockTemplates table
        self.cursor.execute('''
            CREATE TABLE StockTemplates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user TEXT NOT NULL,
                fname TEXT NOT NULL,
                data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user, fname)
            )
        ''')
        self.conn.commit()
    
    def teardown_method(self):
        """Cleanup after each test"""
        self.conn.close()
        os.close(self.db_fd)
        os.unlink(self.db_path)
    
    def test_create_stock_template(self):
        """Test creating a stock analysis template"""
        user = "demo"
        fname = "Financial Statements"
        data = '''
            cell:A1:t:Revenue
            cell:A2:t:Expenses
            cell:A3:t:Profit
            cell:B1:n:1000000
            cell:B2:n:750000
            cell:B3:f:=B1-B2
        '''
        
        self.cursor.execute(
            "INSERT INTO StockTemplates (user, fname, data) VALUES (?, ?, ?)",
            (user, fname, data)
        )
        self.conn.commit()
        
        # Verify template creation
        self.cursor.execute(
            "SELECT fname, data FROM StockTemplates WHERE user = ? AND fname = ?",
            (user, fname)
        )
        result = self.cursor.fetchone()
        
        assert result is not None
        assert result[0] == fname
        assert "Revenue" in result[1]
        assert "=B1-B2" in result[1]
    
    def test_list_templates_for_user(self):
        """Test listing all templates for a user"""
        user = "demo"
        templates = [
            ("Financial Statements", "template1_data"),
            ("Stock Analysis", "template2_data"),
            ("Portfolio Overview", "template3_data")
        ]
        
        # Insert templates
        for fname, data in templates:
            self.cursor.execute(
                "INSERT INTO StockTemplates (user, fname, data) VALUES (?, ?, ?)",
                (user, fname, data)
            )
        self.conn.commit()
        
        # Query templates
        self.cursor.execute(
            "SELECT fname FROM StockTemplates WHERE user = ? ORDER BY fname",
            (user,)
        )
        results = [row[0] for row in self.cursor.fetchall()]
        
        assert len(results) == 3
        assert "Financial Statements" in results
        assert "Stock Analysis" in results
        assert "Portfolio Overview" in results


class TestSharedSheetsOperations:
    """Test SharedSheets table operations"""
    
    def setup_method(self):
        """Setup test database for each test"""
        self.db_fd, self.db_path = tempfile.mkstemp(suffix='.db')
        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()
        
        # Create SharedSheets table
        self.cursor.execute('''
            CREATE TABLE SharedSheets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user TEXT NOT NULL,
                fname TEXT NOT NULL,
                data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user, fname)
            )
        ''')
        self.conn.commit()
    
    def teardown_method(self):
        """Cleanup after each test"""
        self.conn.close()
        os.close(self.db_fd)
        os.unlink(self.db_path)
    
    def test_create_shared_sheet(self):
        """Test creating a shared sheet"""
        user = "demo"
        fname = "shared_analysis_xyz123"
        data = '''
            cell:A1:t:Shared Analysis
            cell:A2:t:AAPL Stock Data
            cell:B2:n:150.25
        '''
        
        self.cursor.execute(
            "INSERT INTO SharedSheets (user, fname, data) VALUES (?, ?, ?)",
            (user, fname, data)
        )
        self.conn.commit()
        
        # Verify shared sheet creation
        self.cursor.execute(
            "SELECT fname, data FROM SharedSheets WHERE user = ? AND fname = ?",
            (user, fname)
        )
        result = self.cursor.fetchone()
        
        assert result is not None
        assert result[0] == fname
        assert "Shared Analysis" in result[1]
        assert "AAPL Stock Data" in result[1]
    
    def test_retrieve_shared_sheet(self):
        """Test retrieving a shared sheet by filename"""
        user = "demo"
        fname = "abc123def456"
        data = "cell:A1:t:Public Financial Model"
        
        # Insert shared sheet
        self.cursor.execute(
            "INSERT INTO SharedSheets (user, fname, data) VALUES (?, ?, ?)",
            (user, fname, data)
        )
        self.conn.commit()
        
        # Retrieve by fname (this simulates the embed URL functionality)
        self.cursor.execute(
            "SELECT data FROM SharedSheets WHERE fname = ?",
            (fname,)
        )
        result = self.cursor.fetchone()
        
        assert result is not None
        assert result[0] == data


class TestDataValidationAndIntegrity:
    """Test data validation and integrity constraints"""
    
    def setup_method(self):
        """Setup test database for each test"""
        self.db_fd, self.db_path = tempfile.mkstemp(suffix='.db')
        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()
        
        # Create test table with constraints
        self.cursor.execute('''
            CREATE TABLE TestSheets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user TEXT NOT NULL CHECK(length(user) > 0),
                fname TEXT NOT NULL CHECK(length(fname) > 0),
                data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user, fname)
            )
        ''')
        self.conn.commit()
    
    def teardown_method(self):
        """Cleanup after each test"""
        self.conn.close()
        os.close(self.db_fd)
        os.unlink(self.db_path)
    
    def test_empty_user_validation(self):
        """Test that empty user names are rejected"""
        with pytest.raises(sqlite3.IntegrityError):
            self.cursor.execute(
                "INSERT INTO TestSheets (user, fname, data) VALUES (?, ?, ?)",
                ("", "test_sheet", "data")
            )
            self.conn.commit()
    
    def test_empty_filename_validation(self):
        """Test that empty filenames are rejected"""
        with pytest.raises(sqlite3.IntegrityError):
            self.cursor.execute(
                "INSERT INTO TestSheets (user, fname, data) VALUES (?, ?, ?)",
                ("testuser", "", "data")
            )
            self.conn.commit()
    
    def test_large_data_handling(self):
        """Test handling of large data blobs"""
        user = "testuser"
        fname = "large_sheet"
        
        # Create large data (1MB of text)
        large_data = "cell:A1:t:" + ("X" * (1024 * 1024))
        
        self.cursor.execute(
            "INSERT INTO TestSheets (user, fname, data) VALUES (?, ?, ?)",
            (user, fname, large_data)
        )
        self.conn.commit()
        
        # Verify large data was stored correctly
        self.cursor.execute(
            "SELECT length(data) FROM TestSheets WHERE user = ? AND fname = ?",
            (user, fname)
        )
        result = self.cursor.fetchone()
        
        assert result is not None
        assert result[0] > 1024 * 1024  # Should be larger than 1MB


class TestDatabasePerformance:
    """Test database performance with larger datasets"""
    
    def setup_method(self):
        """Setup test database for each test"""
        self.db_fd, self.db_path = tempfile.mkstemp(suffix='.db')
        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()
        
        # Create table with indexes for performance
        self.cursor.execute('''
            CREATE TABLE PerformanceTest (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user TEXT NOT NULL,
                fname TEXT NOT NULL,
                data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create indexes
        self.cursor.execute('CREATE INDEX idx_user ON PerformanceTest(user)')
        self.cursor.execute('CREATE INDEX idx_user_fname ON PerformanceTest(user, fname)')
        
        self.conn.commit()
    
    def teardown_method(self):
        """Cleanup after each test"""
        self.conn.close()
        os.close(self.db_fd)
        os.unlink(self.db_path)
    
    def test_bulk_insert_performance(self):
        """Test bulk insert performance"""
        import time
        
        # Prepare bulk data
        test_data = []
        for i in range(1000):
            test_data.append((
                f"user_{i % 10}",  # 10 different users
                f"sheet_{i}",
                f"cell:A1:t:Data for sheet {i}"
            ))
        
        # Measure bulk insert time
        start_time = time.time()
        self.cursor.executemany(
            "INSERT INTO PerformanceTest (user, fname, data) VALUES (?, ?, ?)",
            test_data
        )
        self.conn.commit()
        end_time = time.time()
        
        insert_time = end_time - start_time
        
        # Verify all records inserted
        self.cursor.execute("SELECT COUNT(*) FROM PerformanceTest")
        count = self.cursor.fetchone()[0]
        
        assert count == 1000
        assert insert_time < 1.0  # Should complete in under 1 second
    
    def test_query_performance_with_index(self):
        """Test query performance with proper indexing"""
        import time
        
        # Insert test data
        test_data = []
        for i in range(5000):
            test_data.append((
                f"user_{i % 50}",  # 50 different users
                f"sheet_{i}",
                f"data_{i}"
            ))
        
        self.cursor.executemany(
            "INSERT INTO PerformanceTest (user, fname, data) VALUES (?, ?, ?)",
            test_data
        )
        self.conn.commit()
        
        # Test indexed query performance
        start_time = time.time()
        self.cursor.execute(
            "SELECT COUNT(*) FROM PerformanceTest WHERE user = ?",
            ("user_25",)
        )
        result = self.cursor.fetchone()
        end_time = time.time()
        
        query_time = end_time - start_time
        
        assert result[0] == 100  # Should find 100 records for user_25
        assert query_time < 0.1  # Should be very fast with index


class TestTransactionHandling:
    """Test database transaction handling"""
    
    def setup_method(self):
        """Setup test database for each test"""
        self.db_fd, self.db_path = tempfile.mkstemp(suffix='.db')
        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()
        
        self.cursor.execute('''
            CREATE TABLE TransactionTest (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user TEXT NOT NULL,
                fname TEXT NOT NULL,
                data TEXT,
                UNIQUE(user, fname)
            )
        ''')
        self.conn.commit()
    
    def teardown_method(self):
        """Cleanup after each test"""
        self.conn.close()
        os.close(self.db_fd)
        os.unlink(self.db_path)
    
    def test_transaction_rollback(self):
        """Test transaction rollback on error"""
        user = "testuser"
        
        try:
            # Start transaction
            self.cursor.execute("BEGIN")
            
            # Insert valid record
            self.cursor.execute(
                "INSERT INTO TransactionTest (user, fname, data) VALUES (?, ?, ?)",
                (user, "sheet1", "data1")
            )
            
            # Try to insert duplicate (should fail)
            self.cursor.execute(
                "INSERT INTO TransactionTest (user, fname, data) VALUES (?, ?, ?)",
                (user, "sheet1", "data2")  # Duplicate key
            )
            
            # This should not be reached
            self.conn.commit()
            
        except sqlite3.IntegrityError:
            # Rollback on error
            self.conn.rollback()
        
        # Verify no records were inserted due to rollback
        self.cursor.execute("SELECT COUNT(*) FROM TransactionTest")
        count = self.cursor.fetchone()[0]
        
        assert count == 0
    
    def test_transaction_commit(self):
        """Test successful transaction commit"""
        user = "testuser"
        
        # Start transaction
        self.cursor.execute("BEGIN")
        
        # Insert multiple records
        records = [
            (user, "sheet1", "data1"),
            (user, "sheet2", "data2"),
            (user, "sheet3", "data3")
        ]
        
        for record in records:
            self.cursor.execute(
                "INSERT INTO TransactionTest (user, fname, data) VALUES (?, ?, ?)",
                record
            )
        
        # Commit transaction
        self.conn.commit()
        
        # Verify all records were inserted
        self.cursor.execute("SELECT COUNT(*) FROM TransactionTest WHERE user = ?", (user,))
        count = self.cursor.fetchone()[0]
        
        assert count == 3


if __name__ == '__main__':
    # Run tests with pytest
    pytest.main([__file__, '-v', '--tb=short'])
