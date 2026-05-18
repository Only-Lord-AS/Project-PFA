import logging

class RequestInfoFilter(logging.Filter):
    def filter(self, record):
        if hasattr(record, 'request'):
            record.client_ip = record.request.META.get('REMOTE_ADDR', '0.0.0.0')
            record.request_method = record.request.method
            record.request_path = record.request.path
        else:
            record.client_ip = '-'
            record.request_method = '-'
            record.request_path = '-'
            
        if not hasattr(record, 'status_code'):
            record.status_code = '-'
            
        return True
