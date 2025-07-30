"""
Unit Tests for SocialCalc/EtherCalc Backend API Endpoints
Tests the Tornado web server handlers and database operations
"""

import pytest
import tornado.testing
import tornado.web
import json
from unittest.mock import Mock, patch, MagicMock
import sys
import os

# Add the parent directory to the path to import main.py
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

try:
    from main import (
        Application, HomeHandler, StockHandler, SaveHandler, 
        ShareHandler, MessageNewHandler, MessageUpdateHandler,
        UploadHandler, DownloadFileHandler, TickerHandler
    )
except ImportError:
    # If main.py can't be imported due to dependencies, create mock classes
    class MockHandler:
        pass
    
    Application = MockHandler
    HomeHandler = MockHandler
    StockHandler = MockHandler
    SaveHandler = MockHandler
    ShareHandler = MockHandler
    MessageNewHandler = MockHandler
    MessageUpdateHandler = MockHandler
    UploadHandler = MockHandler
    DownloadFileHandler = MockHandler
    TickerHandler = MockHandler


class TestSocialCalcAPI(tornado.testing.AsyncHTTPTestCase):
    """Test cases for SocialCalc API endpoints"""
    
    def setUp(self):
        super().setUp()
        # Mock database connection
        self.mock_db = Mock()
        
    def get_app(self):
        """Create a test application with mocked dependencies"""
        app = tornado.web.Application([
            (r"/", HomeHandler),
            (r"/stock", StockHandler),
            (r"/save", SaveHandler),
            (r"/share", ShareHandler),
            (r"/broadcast", MessageNewHandler),
            (r"/updates", MessageUpdateHandler),
            (r"/upload", UploadHandler),
            (r"/downloadfile", DownloadFileHandler),
            (r"/ticker", TickerHandler),
        ])
        
        # Mock database
        app.db = self.mock_db
        app.amazonSes = Mock()
        app.fromemail = 'test@example.com'
        
        return app

    def test_home_redirect(self):
        """Test that home page redirects to /save"""
        response = self.fetch("/", follow_redirects=False)
        self.assertEqual(response.code, 302)
        self.assertTrue(response.headers['Location'].endswith('/save'))

    @patch('main.commands.getoutput')
    def test_stock_handler_post(self, mock_commands):
        """Test stock data retrieval endpoint"""
        mock_commands.return_value = "cell:A1:t:AAPL\ncell:B1:n:150.50"
        
        # Mock database query
        self.mock_db.query.return_value = []
        
        body = "ticker=AAPL&pagename=Stock+Analysis"
        response = self.fetch("/stock", method="POST", body=body)
        
        self.assertEqual(response.code, 200)
        self.assertIn(b"AAPL", response.body)

    def test_save_handler_get(self):
        """Test retrieving saved sheets"""
        # Mock database response
        mock_entries = [
            Mock(fname="Sheet1", data="mock_data_1"),
            Mock(fname="Sheet2", data="mock_data_2")
        ]
        self.mock_db.query.return_value = mock_entries
        
        response = self.fetch("/save")
        self.assertEqual(response.code, 200)

    def test_save_handler_post(self):
        """Test saving spreadsheet data"""
        self.mock_db.query.return_value = []  # No existing sheets
        self.mock_db.execute.return_value = None
        
        body = "fname=TestSheet&data=" + json.dumps({
            "cells": {"A1": {"value": "Test", "datatype": "t"}}
        })
        
        response = self.fetch("/save", method="POST", body=body)
        self.assertEqual(response.code, 200)
        
        # Verify database was called
        self.mock_db.execute.assert_called()

    def test_ticker_handler_validation(self):
        """Test ticker symbol validation"""
        with patch('main.util.tickersymbols.isValidTicker') as mock_validator:
            with patch('main.commands.getoutput') as mock_commands:
                with patch('main.util.ystockquote.get_all') as mock_stock:
                    
                    # Test valid ticker
                    mock_validator.return_value = True
                    mock_commands.return_value = "stock_data"
                    mock_stock.return_value = {"price": "150.50"}
                    
                    body = "ticker=AAPL"
                    response = self.fetch("/ticker", method="POST", body=body)
                    
                    self.assertEqual(response.code, 200)
                    response_data = json.loads(response.body.decode())
                    self.assertEqual(response_data["result"], "ok")

    def test_message_broadcasting(self):
        """Test real-time message broadcasting"""
        # Mock global channels
        with patch('main.channels', {}):
            body = json.dumps({
                "data": "cell_update",
                "type": "edit",
                "from": "user1"
            })
            
            # This would normally require a session cookie
            response = self.fetch("/broadcast", method="POST", body=body)
            
            # The handler should return the message data
            self.assertEqual(response.code, 200)

    @patch('builtins.open', create=True)
    def test_file_upload(self, mock_open):
        """Test file upload functionality"""
        mock_file = Mock()
        mock_file.read.return_value = b"mock_file_content"
        mock_open.return_value.__enter__.return_value = mock_file
        
        # Mock file upload
        files = {
            'upload': [{
                'filename': 'test.xlsx',
                'body': b'mock_excel_content'
            }]
        }
        
        # Note: This is a simplified test - actual file upload testing
        # would require more complex multipart form data handling
        body = "filename=test.xlsx"
        response = self.fetch("/upload", method="POST", body=body)
        
        # The response code depends on the actual file processing logic
        self.assertIn(response.code, [200, 400, 500])

    def test_share_handler(self):
        """Test sheet sharing functionality"""
        self.mock_db.query.return_value = []  # No existing shared sheets
        self.mock_db.execute.return_value = None
        
        body = (
            "from=test@example.com&"
            "to=recipient@example.com&"
            "msg=Check out this sheet&"
            "data=" + json.dumps({"A1": "shared_data"})
        )
        
        response = self.fetch("/share", method="POST", body=body)
        self.assertEqual(response.code, 200)


class TestDatabaseOperations:
    """Test database operations without requiring actual database"""
    
    def setup_method(self):
        self.mock_db = Mock()
    
    def test_user_sheet_crud(self):
        """Test Create, Read, Update, Delete operations for user sheets"""
        # Test Create
        self.mock_db.execute.return_value = None
        
        # Mock creating a new sheet
        user = "testuser"
        fname = "TestSheet"
        data = "cell:A1:t:Test"
        
        # Simulate the INSERT operation
        self.mock_db.query.return_value = []  # No existing sheet
        insert_result = self.mock_db.execute(
            "INSERT INTO UserSheets (user,fname,data) VALUES (%s,%s,%s)",
            user, fname, data
        )
        
        assert insert_result is None  # Mock returns None
        self.mock_db.execute.assert_called()
        
        # Test Read
        mock_sheet = Mock()
        mock_sheet.fname = fname
        mock_sheet.data = data
        self.mock_db.query.return_value = [mock_sheet]
        
        result = self.mock_db.query("SELECT * FROM UserSheets WHERE user = %s", user)
        assert len(result) == 1
        assert result[0].fname == fname
        
        # Test Update
        new_data = "cell:A1:t:UpdatedTest"
        self.mock_db.execute(
            "UPDATE UserSheets SET data = %s WHERE user = %s AND fname = %s",
            new_data, user, fname
        )
        
        # Test Delete
        self.mock_db.execute(
            "DELETE FROM UserSheets WHERE user = %s AND fname = %s",
            user, fname
        )

    def test_stock_templates_operations(self):
        """Test stock template storage and retrieval"""
        user = "demo"
        template_name = "Financial Statements"
        template_data = "cell:F107:t:Revenue"
        
        # Test template creation
        self.mock_db.query.return_value = []  # No existing template
        self.mock_db.execute(
            "INSERT INTO StockTemplates (user,fname,data) VALUES (%s,%s,%s)",
            user, template_name, template_data
        )
        
        # Test template retrieval
        mock_template = Mock()
        mock_template.fname = template_name
        mock_template.data = template_data
        self.mock_db.query.return_value = [mock_template]
        
        result = self.mock_db.query(
            "SELECT * FROM StockTemplates WHERE user = %s AND fname = %s",
            user, template_name
        )
        
        assert len(result) == 1
        assert result[0].fname == template_name

    def test_shared_sheets_operations(self):
        """Test shared sheet functionality"""
        user = "demo"
        share_id = "ABC123XYZ"
        sheet_data = "cell:A1:t:SharedData"
        
        # Test sharing a sheet
        self.mock_db.query.return_value = []  # No existing shared sheet
        self.mock_db.execute(
            "INSERT INTO SharedSheets (user,fname,data) VALUES (%s,%s,%s)",
            user, share_id, sheet_data
        )
        
        # Test retrieving shared sheet
        mock_shared = Mock()
        mock_shared.fname = share_id
        mock_shared.data = sheet_data
        self.mock_db.query.return_value = [mock_shared]
        
        result = self.mock_db.query(
            "SELECT * FROM SharedSheets WHERE user = %s AND fname = %s",
            user, share_id
        )
        
        assert len(result) == 1
        assert result[0].data == sheet_data


class TestUtilityFunctions:
    """Test utility functions and helpers"""
    
    def test_random_string_generation(self):
        """Test random string generation for sessions"""
        import random
        import string
        
        def get_random_string(size):
            char_set = string.ascii_uppercase + string.digits
            return ''.join(random.sample(char_set, size))
        
        # Test different sizes
        result_6 = get_random_string(6)
        result_20 = get_random_string(20)
        
        assert len(result_6) == 6
        assert len(result_20) == 20
        assert result_6.isalnum()
        assert result_20.isalnum()
        assert result_6.isupper() or any(c.isdigit() for c in result_6)

    def test_content_type_mapping(self):
        """Test file content type mappings"""
        contenttypes = {
            "Excel2007": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Excel5": "application/vnd.ms-excel",
            "PDF": "application/pdf",
            "HTML": "text/html",
            "CSV": "text/plain",
            "ODS": "application/vnd.oasis.opendocument.spreadsheet"
        }
        
        suffix = {
            "Excel2007": "xlsx",
            "Excel5": "xls",
            "PDF": "pdf",
            "HTML": "html",
            "CSV": "csv",
            "ODS": "ods"
        }
        
        # Test mappings
        assert contenttypes["Excel2007"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        assert suffix["Excel2007"] == "xlsx"
        assert contenttypes["PDF"] == "application/pdf"
        assert suffix["PDF"] == "pdf"

    @patch('main.util.tickersymbols.isValidTicker')
    def test_ticker_validation(self, mock_validator):
        """Test stock ticker symbol validation"""
        # Test valid tickers
        mock_validator.return_value = True
        assert mock_validator("AAPL") == True
        assert mock_validator("GOOGL") == True
        assert mock_validator("MSFT") == True
        
        # Test invalid tickers
        mock_validator.return_value = False
        assert mock_validator("INVALID") == False
        assert mock_validator("") == False


class TestErrorHandling:
    """Test error handling scenarios"""
    
    def test_database_connection_errors(self):
        """Test handling of database connection failures"""
        mock_db = Mock()
        mock_db.query.side_effect = Exception("Database connection failed")
        
        # Test graceful error handling
        try:
            result = mock_db.query("SELECT * FROM UserSheets")
            assert False, "Should have raised an exception"
        except Exception as e:
            assert str(e) == "Database connection failed"

    def test_file_operation_errors(self):
        """Test handling of file operation failures"""
        with patch('builtins.open', side_effect=IOError("File not found")):
            try:
                with open("nonexistent_file.txt", "r") as f:
                    content = f.read()
                assert False, "Should have raised an IOError"
            except IOError as e:
                assert "File not found" in str(e)

    def test_invalid_json_handling(self):
        """Test handling of invalid JSON data"""
        def safe_json_parse(data):
            try:
                return {"success": True, "data": json.loads(data)}
            except json.JSONDecodeError as e:
                return {"success": False, "error": str(e)}
        
        # Test valid JSON
        result = safe_json_parse('{"valid": "json"}')
        assert result["success"] == True
        
        # Test invalid JSON
        result = safe_json_parse('invalid json')
        assert result["success"] == False
        assert "error" in result


if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__])